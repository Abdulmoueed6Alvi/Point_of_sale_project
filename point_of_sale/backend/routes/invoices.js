const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const { auth } = require('../middleware/auth');

// Get invoice by ID (alias for sale)
router.get('/:id', auth, async (req, res) => {
    try {
        const invoice = await Sale.findById(req.params.id)
            .populate('soldBy', 'name email')
            .populate('items.product', 'name sku category');

        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        res.json({ invoice });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching invoice', error: error.message });
    }
});

// Get invoice by invoice number
router.get('/number/:invoiceNumber', auth, async (req, res) => {
    try {
        const invoice = await Sale.findOne({ invoiceNumber: req.params.invoiceNumber })
            .populate('soldBy', 'name email')
            .populate('items.product', 'name sku category');

        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        res.json({ invoice });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching invoice', error: error.message });
    }
});

// Get all invoices with pagination
router.get('/', auth, async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;

        const query = search
            ? {
                $or: [
                    { invoiceNumber: { $regex: search, $options: 'i' } },
                    { 'customer.name': { $regex: search, $options: 'i' } },
                    { 'customer.phone': { $regex: search, $options: 'i' } }
                ]
            }
            : {};

        const invoices = await Sale.find(query)
            .populate('soldBy', 'name')
            .populate('items.product', 'name sku')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await Sale.countDocuments(query);

        res.json({
            invoices,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching invoices', error: error.message });
    }
});

module.exports = router;
