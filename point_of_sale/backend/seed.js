const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pos_sanitary_store');
        console.log('MongoDB Connected');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@pos.com' });

        if (existingAdmin) {
            console.log('Admin user already exists!');
            console.log('Email: admin@pos.com');
            console.log('Password: admin123');
        } else {
            // Create admin user
            const admin = new User({
                name: 'Admin User',
                email: 'admin@pos.com',
                password: 'admin123',
                role: 'admin',
                isActive: true
            });

            await admin.save();
            console.log('✅ Admin user created successfully!');
            console.log('Email: admin@pos.com');
            console.log('Password: admin123');
        }

        await mongoose.disconnect();
        console.log('\nDatabase seeding complete!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedAdmin();
