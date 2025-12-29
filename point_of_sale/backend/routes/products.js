const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const InventoryLog = require('../models/InventoryLog');
const { auth, authorize } = require('../middleware/auth');
const { activityLogger } = require('../middleware/logger');

// Get all products with filtering and pagination
router.get('/', auth, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            category = '',
            stockStatus = '',
            isActive = ''
        } = req.query;

        const query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { sku: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        if (category) query.category = category;
        if (isActive !== '') query.isActive = isActive === 'true';

        const products = await Product.find(query)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 })
            .exec();

        const count = await Product.countDocuments(query);

        // Filter by stock status if needed
        let filteredProducts = products;
        if (stockStatus) {
            filteredProducts = products.filter(p => {
                const status = p.stockStatus;
                return status === stockStatus;
            });
        }

        res.json({
            products: filteredProducts,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error: error.message });
    }
});

// Get single product
router.get('/:id', auth, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ product });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching product', error: error.message });
    }
});

// Create new product
router.post('/', [
    auth,
    authorize('admin', 'manager'),
    activityLogger('create_product', 'products'),
    body('name').trim().notEmpty().withMessage('Product name is required'),
    body('sku').trim().notEmpty().withMessage('SKU is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('purchasePrice').isFloat({ min: 0 }).withMessage('Valid purchase price is required'),
    body('sellingPrice').isFloat({ min: 0 }).withMessage('Valid selling price is required'),
    body('stock').isInt({ min: 0 }).withMessage('Valid stock quantity is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const product = new Product(req.body);
        await product.save();

        // Log initial inventory
        const inventoryLog = new InventoryLog({
            product: product._id,
            type: 'initial',
            quantityChange: product.stock,
            previousStock: 0,
            newStock: product.stock,
            notes: 'Initial stock entry',
            performedBy: req.userId
        });
        await inventoryLog.save();

        res.status(201).json({
            message: 'Product created successfully',
            product
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'SKU already exists' });
        }
        res.status(500).json({ message: 'Error creating product', error: error.message });
    }
});

// Update product
router.put('/:id', [
    auth,
    authorize('admin', 'manager'),
    activityLogger('update_product', 'products')
], async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Don't allow direct stock updates through this route
        if (req.body.stock !== undefined) {
            delete req.body.stock;
        }

        Object.assign(product, req.body);
        await product.save();

        res.json({
            message: 'Product updated successfully',
            product
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating product', error: error.message });
    }
});

// Delete product (soft delete)
router.delete('/:id', [
    auth,
    authorize('admin'),
    activityLogger('delete_product', 'products')
], async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        product.isActive = false;
        await product.save();

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product', error: error.message });
    }
});

// Get low stock products
router.get('/alerts/low-stock', auth, async (req, res) => {
    try {
        const products = await Product.find({
            isActive: true,
            $expr: { $lte: ['$stock', '$minStockLevel'] }
        }).sort({ stock: 1 });

        res.json({ products, count: products.length });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching low stock products', error: error.message });
    }
});

module.exports = router;
