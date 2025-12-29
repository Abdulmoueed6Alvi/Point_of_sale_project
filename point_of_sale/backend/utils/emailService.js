const nodemailer = require('nodemailer');

// Create transporter for sending emails
// Using Gmail - you'll need to set up App Password in Gmail settings
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

// Send welcome email to new employee
const sendWelcomeEmail = async (employeeEmail, employeeName, password, role) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"POS Sanitary Store" <${process.env.EMAIL_USER || 'noreply@pos-store.com'}>`,
            to: employeeEmail,
            subject: '🎉 Welcome to POS Sanitary Store - Your Account Details',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0; }
                        .header h1 { color: white; margin: 0; font-size: 28px; }
                        .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0; }
                        .content { background: white; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                        .greeting { font-size: 24px; color: #1e293b; margin-bottom: 20px; }
                        .message { color: #475569; line-height: 1.8; font-size: 16px; }
                        .credentials { background: #f1f5f9; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #3b82f6; }
                        .credentials h3 { color: #1e293b; margin: 0 0 15px; }
                        .credential-item { margin: 12px 0; }
                        .credential-label { color: #64748b; font-size: 14px; }
                        .credential-value { color: #1e293b; font-size: 18px; font-weight: 600; font-family: monospace; background: white; padding: 8px 12px; border-radius: 6px; display: inline-block; margin-top: 5px; }
                        .role-badge { display: inline-block; padding: 6px 16px; border-radius: 20px; font-weight: 600; text-transform: capitalize; margin-top: 10px; }
                        .role-admin { background: #fef2f2; color: #dc2626; }
                        .role-manager { background: #f0fdf4; color: #16a34a; }
                        .role-cashier { background: #fefce8; color: #ca8a04; }
                        .warning { background: #fef3c7; border: 1px solid #fcd34d; padding: 15px; border-radius: 8px; margin-top: 25px; }
                        .warning p { color: #92400e; margin: 0; font-size: 14px; }
                        .footer { text-align: center; padding: 30px; color: #94a3b8; font-size: 13px; }
                        .btn { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🏪 POS Sanitary Store</h1>
                            <p>Inventory & Sales Management System</p>
                        </div>
                        <div class="content">
                            <div class="greeting">Welcome, ${employeeName}! 👋</div>
                            <p class="message">
                                You have been added as a new team member to POS Sanitary Store. 
                                Below are your login credentials to access the system.
                            </p>
                            
                            <div class="credentials">
                                <h3>🔐 Your Login Credentials</h3>
                                <div class="credential-item">
                                    <div class="credential-label">Email Address</div>
                                    <div class="credential-value">${employeeEmail}</div>
                                </div>
                                <div class="credential-item">
                                    <div class="credential-label">Password</div>
                                    <div class="credential-value">${password}</div>
                                </div>
                                <div class="credential-item">
                                    <div class="credential-label">Your Role</div>
                                    <span class="role-badge role-${role}">${role}</span>
                                </div>
                            </div>
                            
                            <div class="warning">
                                <p>⚠️ <strong>Important:</strong> Please change your password after your first login for security purposes.</p>
                            </div>
                            
                            <p class="message" style="margin-top: 25px;">
                                If you have any questions, please contact your administrator.
                            </p>
                        </div>
                        <div class="footer">
                            <p>© 2024 POS Sanitary Store. All rights reserved.</p>
                            <p>This is an automated email. Please do not reply.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Welcome email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending welcome email:', error.message);
        // Don't throw error, just return failure - email failure shouldn't block user creation
        return { success: false, error: error.message };
    }
};

module.exports = { sendWelcomeEmail };
