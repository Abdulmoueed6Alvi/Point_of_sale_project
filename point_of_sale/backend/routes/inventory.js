const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const InventoryLog = require('../models/InventoryLog');
const { auth, authorize } = require('../middleware/auth');
const { activityLogger } = require('../middleware/logger');

// Get inventory logs with filtering
router.get('/logs', auth, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            productId = '',
            type = '',
            startDate = '',
            endDate = ''
        } = req.query;

        const query = {};

        if (productId) query.product = productId;
        if (type) query.type = type;

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const logs = await InventoryLog.find(query)
            .populate('product', 'name sku category')
            .populate('performedBy', 'name email')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 })
            .exec();

        const count = await InventoryLog.countDocuments(query);

        res.json({
            logs,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching inventory logs', error: error.message });
    }
});

// Adjust inventory (manual adjustment)
router.post('/adjust', [
    auth,
    authorize('admin', 'manager'),
    activityLogger('inventory_adjustment', 'inventory')
], async (req, res) => {
    try {
        const { productId, quantity, type, notes } = req.body;

        if (!productId || quantity === undefined || !type) {
            return res.status(400).json({
                message: 'Product ID, quantity, and type are required'
            });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const previousStock = product.stock;
        let quantityChange = quantity;

        // Determine if adding or removing stock
        if (type === 'damage' || type === 'adjustment' && quantity < 0) {
            if (Math.abs(quantity) > product.stock) {
                return res.status(400).json({
                    message: 'Cannot remove more than available stock'
                });
            }
            quantityChange = -Math.abs(quantity);
        } else if (type === 'purchase' || type === 'adjustment' && quantity > 0) {
            quantityChange = Math.abs(quantity);
        }

        product.stock += quantityChange;
        await product.save();

        // Create inventory log
        const inventoryLog = new InventoryLog({
            product: product._id,
            type,
            quantityChange,
            previousStock,
            newStock: product.stock,
            notes,
            performedBy: req.userId
        });
        await inventoryLog.save();

        await inventoryLog.populate('product', 'name sku');
        await inventoryLog.populate('performedBy', 'name email');

        res.json({
            message: 'Inventory adjusted successfully',
            log: inventoryLog,
            product: {
                id: product._id,
                name: product.name,
                sku: product.sku,
                previousStock,
                currentStock: product.stock
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error adjusting inventory', error: error.message });
    }
});

// Get inventory summary
router.get('/summary', auth, async (req, res) => {
    try {
        const summary = await Product.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: '$category',
                    totalProducts: { $sum: 1 },
                    totalStockValue: {
                        $sum: { $multiply: ['$stock', '$purchasePrice'] }
                    },
                    totalSellingValue: {
                        $sum: { $multiply: ['$stock', '$sellingPrice'] }
                    },
                    lowStockCount: {
                        $sum: {
                            $cond: [{ $lte: ['$stock', '$minStockLevel'] }, 1, 0]
                        }
                    },
                    outOfStockCount: {
                        $sum: {
                            $cond: [{ $eq: ['$stock', 0] }, 1, 0]
                        }
                    }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Overall summary
        const overall = await Product.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: null,
                    totalProducts: { $sum: 1 },
                    totalStockValue: {
                        $sum: { $multiply: ['$stock', '$purchasePrice'] }
                    },
                    totalSellingValue: {
                        $sum: { $multiply: ['$stock', '$sellingPrice'] }
                    },
                    lowStockCount: {
                        $sum: {
                            $cond: [{ $lte: ['$stock', '$minStockLevel'] }, 1, 0]
                        }
                    },
                    outOfStockCount: {
                        $sum: {
                            $cond: [{ $eq: ['$stock', 0] }, 1, 0]
                        }
                    }
                }
            }
        ]);

        res.json({
            byCategory: summary,
            overall: overall[0] || {}
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching inventory summary', error: error.message });
    }
});

// Get inventory movements for a product
router.get('/movements/:productId', auth, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const query = { product: req.params.productId };

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const movements = await InventoryLog.find(query)
            .populate('performedBy', 'name email')
            .sort({ createdAt: -1 })
            .limit(100);

        const product = await Product.findById(req.params.productId);

        res.json({
            product: {
                id: product._id,
                name: product.name,
                sku: product.sku,
                currentStock: product.stock
            },
            movements
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching inventory movements', error: error.message });
    }
});

module.exports = router;
