const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: [
            'login', 'logout',
            'create_product', 'update_product', 'delete_product',
            'create_sale', 'update_sale', 'cancel_sale', 'refund_sale',
            'create_user', 'update_user', 'delete_user',
            'inventory_adjustment',
            'generate_report',
            'backup_data',
            'system_setting_change'
        ]
    },
    module: {
        type: String,
        enum: ['auth', 'products', 'sales', 'inventory', 'users', 'reports', 'settings', 'system'],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    entityType: {
        type: String, // Product, Sale, User, etc.
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId
    },
    ipAddress: String,
    userAgent: String,
    metadata: {
        type: mongoose.Schema.Types.Mixed // Additional data specific to the action
    },
    status: {
        type: String,
        enum: ['success', 'failed', 'warning'],
        default: 'success'
    }
}, {
    timestamps: true
});

// Index for efficient querying
activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ action: 1 });
activityLogSchema.index({ module: 1 });
activityLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
