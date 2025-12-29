const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const InventoryLog = require('../models/InventoryLog');
const { auth, authorize } = require('../middleware/auth');
const { activityLogger } = require('../middleware/logger');

// Get all sales with filtering and pagination
router.get('/', auth, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            startDate = '',
            endDate = '',
            paymentStatus = '',
            status = ''
        } = req.query;

        const query = {};

        // Cashiers can only see their own sales
        if (req.user.role === 'cashier') {
            query.soldBy = req.userId;
        }

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        if (paymentStatus) query.paymentStatus = paymentStatus;
        if (status) query.status = status;

        const sales = await Sale.find(query)
            .populate('soldBy', 'name email')
            .populate('items.product', 'name sku')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 })
            .exec();

        const count = await Sale.countDocuments(query);

        res.json({
            sales,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sales', error: error.message });
    }
});

// Get single sale
router.get('/:id', auth, async (req, res) => {
    try {
        const sale = await Sale.findById(req.params.id)
            .populate('soldBy', 'name email')
            .populate('items.product', 'name sku category');

        if (!sale) {
            return res.status(404).json({ message: 'Sale not found' });
        }

        res.json({ sale });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sale', error: error.message });
    }
});

// Create new sale
router.post('/', [
    auth,
    activityLogger('create_sale', 'sales'),
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('paymentMethod').isIn(['cash', 'card', 'upi', 'cheque', 'bank_transfer'])
], async (req, res) => {
    try {
        console.log('Creating sale with data:', JSON.stringify(req.body, null, 2));

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Validation errors:', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        const { items, customer, paymentMethod, tax, discount, notes, amountPaid } = req.body;

        // Set default customer if not provided
        const customerData = customer && customer.name ? customer : { name: 'Walk-in Customer' };

        // Validate and prepare sale items
        const saleItems = [];
        let subtotal = 0;

        for (const item of items) {
            console.log('Looking for product:', item.product);
            const product = await Product.findById(item.product);
            console.log('Found product:', product ? product.name : 'NOT FOUND');

            if (!product) {
                console.log('Product not found error for ID:', item.product);
                return res.status(404).json({
                    message: `Product not found: ${item.product}`
                });
            }

            if (!product.isActive) {
                console.log('Product inactive:', product.name);
                return res.status(400).json({
                    message: `Product is inactive: ${product.name}`
                });
            }

            if (product.stock < item.quantity) {
                console.log('Insufficient stock:', product.name, 'has', product.stock, 'need', item.quantity);
                return res.status(400).json({
                    message: `Insufficient stock for ${product.name}. Available: ${product.stock}`
                });
            }

            const itemSubtotal = product.sellingPrice * item.quantity - (item.discount || 0);

            saleItems.push({
                product: product._id,
                productName: product.name,
                sku: product.sku,
                quantity: item.quantity,
                unitPrice: product.sellingPrice,
                subtotal: itemSubtotal,
                discount: item.discount || 0
            });

            subtotal += itemSubtotal;
        }

        // Calculate total
        const taxAmount = tax || 0;
        const discountAmount = discount || 0;
        const total = subtotal + taxAmount - discountAmount;
        const paid = amountPaid || total;
        const due = total - paid;

        // Create sale
        const sale = new Sale({
            items: saleItems,
            subtotal,
            tax: taxAmount,
            discount: discountAmount,
            total,
            paymentMethod,
            paymentStatus: due > 0 ? 'partial' : 'paid',
            amountPaid: paid,
            amountDue: due,
            customer: customerData,
            soldBy: req.userId,
            notes,
            status: 'completed'
        });

        console.log('Saving sale...');
        await sale.save();
        console.log('Sale saved with invoice:', sale.invoiceNumber);

        // Update inventory for each item
        for (const item of saleItems) {
            const product = await Product.findById(item.product);
            const previousStock = product.stock;
            product.stock -= item.quantity;
            await product.save();
            console.log('Updated stock for', product.name, 'from', previousStock, 'to', product.stock);

            // Log inventory change
            const inventoryLog = new InventoryLog({
                product: product._id,
                type: 'sale',
                quantityChange: -item.quantity,
                previousStock,
                newStock: product.stock,
                reference: sale.invoiceNumber,
                referenceId: sale._id,
                referenceModel: 'Sale',
                performedBy: req.userId
            });
            await inventoryLog.save();
        }

        await sale.populate('soldBy', 'name email');
        console.log('Sale completed successfully');

        res.status(201).json({
            message: 'Sale created successfully',
            sale
        });
    } catch (error) {
        console.error('Error creating sale:', error);
        res.status(500).json({ message: 'Error creating sale', error: error.message });
    }
});

// Update sale (limited fields)
router.put('/:id', [
    auth,
    authorize('admin', 'manager'),
    activityLogger('update_sale', 'sales')
], async (req, res) => {
    try {
        const sale = await Sale.findById(req.params.id);
        if (!sale) {
            return res.status(404).json({ message: 'Sale not found' });
        }

        // Only allow updating specific fields
        const allowedUpdates = ['customer', 'notes', 'paymentStatus', 'amountPaid'];
        const updates = {};

        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        if (updates.amountPaid !== undefined) {
            updates.amountDue = sale.total - updates.amountPaid;
            if (updates.amountDue <= 0) {
                updates.paymentStatus = 'paid';
                updates.amountDue = 0;
            }
        }

        Object.assign(sale, updates);
        await sale.save();

        res.json({
            message: 'Sale updated successfully',
            sale
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating sale', error: error.message });
    }
});

// Cancel sale
router.post('/:id/cancel', [
    auth,
    authorize('admin', 'manager'),
    activityLogger('cancel_sale', 'sales')
], async (req, res) => {
    try {
        const sale = await Sale.findById(req.params.id);
        if (!sale) {
            return res.status(404).json({ message: 'Sale not found' });
        }

        if (sale.status === 'cancelled') {
            return res.status(400).json({ message: 'Sale is already cancelled' });
        }

        // Restore inventory
        for (const item of sale.items) {
            const product = await Product.findById(item.product);
            const previousStock = product.stock;
            product.stock += item.quantity;
            await product.save();

            // Log inventory change
            const inventoryLog = new InventoryLog({
                product: product._id,
                type: 'return',
                quantityChange: item.quantity,
                previousStock,
                newStock: product.stock,
                reference: `Cancelled: ${sale.invoiceNumber}`,
                referenceId: sale._id,
                referenceModel: 'Sale',
                notes: req.body.reason || 'Sale cancelled',
                performedBy: req.userId
            });
            await inventoryLog.save();
        }

        sale.status = 'cancelled';
        sale.notes = (sale.notes || '') + `\n[CANCELLED] ${req.body.reason || 'No reason provided'}`;
        await sale.save();

        res.json({
            message: 'Sale cancelled successfully',
            sale
        });
    } catch (error) {
        res.status(500).json({ message: 'Error cancelling sale', error: error.message });
    }
});

// Get sales statistics
router.get('/stats/summary', auth, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const dateFilter = {};

        if (startDate || endDate) {
            dateFilter.createdAt = {};
            if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
            if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
        }

        const stats = await Sale.aggregate([
            { $match: { ...dateFilter, status: 'completed' } },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: 1 },
                    totalRevenue: { $sum: '$total' },
                    totalPaid: { $sum: '$amountPaid' },
                    totalDue: { $sum: '$amountDue' },
                    avgSaleValue: { $avg: '$total' }
                }
            }
        ]);

        res.json({ stats: stats[0] || {} });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sales statistics', error: error.message });
    }
});

module.exports = router;
