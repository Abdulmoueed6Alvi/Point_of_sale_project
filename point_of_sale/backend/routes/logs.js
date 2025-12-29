const express = require('express');
const router = express.Router();
const ActivityLog = require('../models/ActivityLog');
const { auth, authorize } = require('../middleware/auth');

// Get activity logs
router.get('/activity', [auth, authorize('admin', 'manager')], async (req, res) => {
    try {
        const {
            page = 1,
            limit = 50,
            userId = '',
            action = '',
            module = '',
            startDate = '',
            endDate = ''
        } = req.query;

        const query = {};

        if (userId) query.user = userId;
        if (action) query.action = action;
        if (module) query.module = module;

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const logs = await ActivityLog.find(query)
            .populate('user', 'name email role')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 })
            .exec();

        const count = await ActivityLog.countDocuments(query);

        res.json({
            logs,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching activity logs', error: error.message });
    }
});

// Get user activity summary
router.get('/activity/user/:userId', [auth, authorize('admin', 'manager')], async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const dateFilter = {};

        if (startDate || endDate) {
            dateFilter.createdAt = {};
            if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
            if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
        }

        const summary = await ActivityLog.aggregate([
            { $match: { user: req.params.userId, ...dateFilter } },
            {
                $group: {
                    _id: '$action',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        res.json({ summary });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user activity summary', error: error.message });
    }
});

// Get system activity stats
router.get('/activity/stats', [auth, authorize('admin')], async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const dateFilter = {};

        if (startDate || endDate) {
            dateFilter.createdAt = {};
            if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
            if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
        }

        const statsByModule = await ActivityLog.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: '$module',
                    count: { $sum: 1 },
                    successCount: {
                        $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
                    },
                    failedCount: {
                        $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
                    }
                }
            },
            { $sort: { count: -1 } }
        ]);

        const statsByAction = await ActivityLog.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: '$action',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        res.json({
            byModule: statsByModule,
            topActions: statsByAction
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching activity stats', error: error.message });
    }
});

module.exports = router;
