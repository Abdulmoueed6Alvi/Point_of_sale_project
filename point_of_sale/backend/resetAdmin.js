const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const resetAdminPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pos_sanitary_store');
        console.log('MongoDB Connected');

        // Find admin user and reset password
        const admin = await User.findOne({ email: 'admin@pos.com' });

        if (admin) {
            admin.password = 'admin123';
            admin.isActive = true;
            await admin.save();
            console.log('✅ Admin password reset successfully!');
            console.log('Email: admin@pos.com');
            console.log('Password: admin123');
        } else {
            // Create admin if not exists
            const newAdmin = new User({
                name: 'Admin User',
                email: 'admin@pos.com',
                password: 'admin123',
                role: 'admin',
                isActive: true
            });
            await newAdmin.save();
            console.log('✅ Admin user created!');
            console.log('Email: admin@pos.com');
            console.log('Password: admin123');
        }

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

resetAdminPassword();
