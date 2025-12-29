const ActivityLog = require('../models/ActivityLog');

const logActivity = async (userId, action, module, description, options = {}) => {
    try {
        const log = new ActivityLog({
            user: userId,
            action,
            module,
            description,
            entityType: options.entityType,
            entityId: options.entityId,
            ipAddress: options.ipAddress,
            userAgent: options.userAgent,
            metadata: options.metadata,
            status: options.status || 'success'
        });
        await log.save();
    } catch (error) {
        console.error('Error logging activity:', error);
    }
};

const activityLogger = (action, module) => {
    return async (req, res, next) => {
        // Store original send function
        const originalSend = res.send;

        res.send = function (data) {
            // Log activity after successful response
            if (res.statusCode < 400 && req.userId) {
                logActivity(
                    req.userId,
                    action,
                    module,
                    `${action.replace(/_/g, ' ')} performed`,
                    {
                        ipAddress: req.ip,
                        userAgent: req.get('user-agent'),
                        metadata: {
                            method: req.method,
                            path: req.path,
                            params: req.params,
                            query: req.query
                        },
                        status: 'success'
                    }
                );
            }

            originalSend.call(this, data);
        };

        next();
    };
};

module.exports = { logActivity, activityLogger };
