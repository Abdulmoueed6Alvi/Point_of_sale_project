const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const InventoryLog = require('../models/InventoryLog');
const ActivityLog = require('../models/ActivityLog');
const { auth } = require('../middleware/auth');

// Get dashboard statistics
router.get('/stats', auth, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        // Today's sales
        const todaySales = await Sale.aggregate([
            {
                $match: {
                    createdAt: { $gte: today },
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                    revenue: { $sum: '$total' }
                }
            }
        ]);

        // This month's sales
        const monthSales = await Sale.aggregate([
            {
                $match: {
                    createdAt: { $gte: thisMonth },
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                    revenue: { $sum: '$total' }
                }
            }
        ]);

        // Product statistics
        const productStats = await Product.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: null,
                    totalProducts: { $sum: 1 },
                    totalValue: {
                        $sum: { $multiply: ['$stock', '$purchasePrice'] }
                    },
                    lowStock: {
                        $sum: {
                            $cond: [{ $lte: ['$stock', '$minStockLevel'] }, 1, 0]
                        }
                    },
                    outOfStock: {
                        $sum: {
                            $cond: [{ $eq: ['$stock', 0] }, 1, 0]
                        }
                    }
                }
            }
        ]);

        // Pending payments
        const pendingPayments = await Sale.aggregate([
            {
                $match: {
                    paymentStatus: { $in: ['pending', 'partial'] },
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                    totalDue: { $sum: '$amountDue' }
                }
            }
        ]);

        // Recent activities
        const recentActivities = await ActivityLog.find()
            .populate('user', 'name')
            .sort({ createdAt: -1 })
            .limit(10);

        // Top selling products (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const topProducts = await Sale.aggregate([
            {
                $match: {
                    createdAt: { $gte: thirtyDaysAgo },
                    status: 'completed'
                }
            },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.product',
                    productName: { $first: '$items.productName' },
                    totalQuantity: { $sum: '$items.quantity' },
                    totalRevenue: { $sum: '$items.subtotal' }
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 5 }
        ]);

        // Sales trend (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const salesTrend = await Sale.aggregate([
            {
                $match: {
                    createdAt: { $gte: sevenDaysAgo },
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                    },
                    count: { $sum: 1 },
                    revenue: { $sum: '$total' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            today: todaySales[0] || { count: 0, revenue: 0 },
            thisMonth: monthSales[0] || { count: 0, revenue: 0 },
            products: productStats[0] || { totalProducts: 0, totalValue: 0, lowStock: 0, outOfStock: 0 },
            pendingPayments: pendingPayments[0] || { count: 0, totalDue: 0 },
            topProducts,
            salesTrend,
            recentActivities
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
    }
});

// Get sales by category
router.get('/sales-by-category', auth, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const dateFilter = {};

        if (startDate || endDate) {
            dateFilter.createdAt = {};
            if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
            if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
        }

        const salesByCategory = await Sale.aggregate([
            { $match: { ...dateFilter, status: 'completed' } },
            { $unwind: '$items' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'items.product',
                    foreignField: '_id',
                    as: 'productInfo'
                }
            },
            { $unwind: '$productInfo' },
            {
                $group: {
                    _id: '$productInfo.category',
                    totalQuantity: { $sum: '$items.quantity' },
                    totalRevenue: { $sum: '$items.subtotal' }
                }
            },
            { $sort: { totalRevenue: -1 } }
        ]);

        res.json({ salesByCategory });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sales by category', error: error.message });
    }
});

module.exports = router;
