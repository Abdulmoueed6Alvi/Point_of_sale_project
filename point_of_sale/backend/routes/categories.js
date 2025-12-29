const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Category = require('../models/Category');
const { auth, authorize } = require('../middleware/auth');

// Get all categories
router.get('/', auth, async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true })
            .sort({ displayName: 1 });
        res.json({ categories });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories', error: error.message });
    }
});

// Get all categories including inactive (for admin)
router.get('/all', [auth, authorize('admin', 'manager')], async (req, res) => {
    try {
        const categories = await Category.find()
            .populate('createdBy', 'name')
            .sort({ displayName: 1 });
        res.json({ categories });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories', error: error.message });
    }
});

// Create new category
router.post('/', [
    auth,
    authorize('admin', 'manager'),
    body('name').trim().notEmpty().withMessage('Category name is required'),
    body('displayName').trim().notEmpty().withMessage('Display name is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, displayName, description } = req.body;

        // Check if category exists
        const existingCategory = await Category.findOne({
            name: name.toLowerCase().trim()
        });

        if (existingCategory) {
            return res.status(400).json({ message: 'Category already exists' });
        }

        const category = new Category({
            name: name.toLowerCase().trim(),
            displayName,
            description,
            createdBy: req.userId
        });

        await category.save();

        res.status(201).json({
            message: 'Category created successfully',
            category
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating category', error: error.message });
    }
});

// Update category
router.put('/:id', [
    auth,
    authorize('admin', 'manager'),
    body('displayName').optional().trim().notEmpty()
], async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        const { displayName, description, isActive } = req.body;

        if (displayName) category.displayName = displayName;
        if (description !== undefined) category.description = description;
        if (isActive !== undefined) category.isActive = isActive;

        await category.save();

        res.json({
            message: 'Category updated successfully',
            category
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating category', error: error.message });
    }
});

// Delete category (permanent delete - admin only)
router.delete('/:id', [auth, authorize('admin')], async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Permanently delete the category from the database
        await Category.findByIdAndDelete(req.params.id);

        res.json({ message: 'Category permanently deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting category', error: error.message });
    }
});

module.exports = router;
