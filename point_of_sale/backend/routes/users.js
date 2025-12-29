const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');
const { logActivity } = require('../middleware/logger');
const { sendWelcomeEmail } = require('../utils/emailService');

// Get all users (Admin only)
router.get('/', [auth, authorize('admin')], async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json({ users });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
});

// Get single user
router.get('/:id', [auth, authorize('admin')], async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ user });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user', error: error.message });
    }
});

// Create new user/employee (Admin only)
router.post('/', [
    auth,
    authorize('admin'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['admin', 'manager', 'cashier']).withMessage('Valid role is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password, role } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        const user = new User({ name, email, password, role });
        await user.save();

        // Log activity
        await logActivity(req.userId, 'create_user', 'users', `New employee added: ${name} (${role})`, {
            entityType: 'User',
            entityId: user._id
        });

        // Send welcome email to new employee
        const emailResult = await sendWelcomeEmail(email, name, password, role);

        res.status(201).json({
            message: 'Employee added successfully',
            emailSent: emailResult.success,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isActive: user.isActive
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
});

// Update user (Admin only)
router.put('/:id', [
    auth,
    authorize('admin'),
    body('name').optional().trim().notEmpty(),
    body('email').optional().isEmail().normalizeEmail(),
    body('role').optional().isIn(['admin', 'manager', 'cashier'])
], async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { name, email, role, isActive, password } = req.body;

        if (name) user.name = name;
        if (email) user.email = email;
        if (role) user.role = role;
        if (isActive !== undefined) user.isActive = isActive;
        if (password && password.length >= 6) user.password = password;

        await user.save();

        await logActivity(req.userId, 'update_user', 'users', `Employee updated: ${user.name}`, {
            entityType: 'User',
            entityId: user._id
        });

        res.json({
            message: 'Employee updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isActive: user.isActive
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
});

// Deactivate user (Admin only)
router.put('/:id/deactivate', [auth, authorize('admin')], async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user._id.toString() === req.userId) {
            return res.status(400).json({ message: 'Cannot deactivate your own account' });
        }

        user.isActive = false;
        await user.save();

        await logActivity(req.userId, 'deactivate_user', 'users', `Employee deactivated: ${user.name}`, {
            entityType: 'User',
            entityId: user._id
        });

        res.json({ message: 'Employee deactivated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deactivating user', error: error.message });
    }
});

// Permanently Delete user (Admin only)
router.delete('/:id', [auth, authorize('admin')], async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Don't allow deleting own account
        if (user._id.toString() === req.userId) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }

        const userName = user.name;
        await User.findByIdAndDelete(req.params.id);

        await logActivity(req.userId, 'delete_user', 'users', `Employee permanently deleted: ${userName}`, {
            entityType: 'User',
            entityId: req.params.id
        });

        res.json({ message: 'Employee permanently deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
});

module.exports = router;
