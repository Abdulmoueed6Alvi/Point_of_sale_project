// Script to create test users for each role
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const createTestUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Test users for each role
        const testUsers = [
            {
                name: 'Admin User',
                email: 'admin@pos.com',
                password: 'admin123',
                role: 'admin'
            },
            {
                name: 'Manager User',
                email: 'manager@pos.com',
                password: 'manager123',
                role: 'manager'
            },
            {
                name: 'Cashier User',
                email: 'cashier@pos.com',
                password: 'cashier123',
                role: 'cashier'
            }
        ];

        for (const userData of testUsers) {
            // Check if user already exists
            const existingUser = await User.findOne({ email: userData.email });

            if (existingUser) {
                // Update the existing user's password and role
                existingUser.password = userData.password;
                existingUser.role = userData.role;
                existingUser.isActive = true;
                await existingUser.save();
                console.log(`✅ Updated existing user: ${userData.email} (${userData.role})`);
            } else {
                // Create new user
                const user = new User(userData);
                await user.save();
                console.log(`✅ Created new user: ${userData.email} (${userData.role})`);
            }
        }

        console.log('\n=== Test Users Created ===');
        console.log('Admin:   admin@pos.com / admin123');
        console.log('Manager: manager@pos.com / manager123');
        console.log('Cashier: cashier@pos.com / cashier123');
        console.log('==========================\n');

        await mongoose.disconnect();
        console.log('Done!');
        process.exit(0);
    } catch (error) {
        console.error('Error creating test users:', error);
        process.exit(1);
    }
};

createTestUsers();
