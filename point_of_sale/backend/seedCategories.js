// Script to seed default categories
require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category');

const defaultCategories = [
    { name: 'tiles', displayName: 'Tiles', description: 'Floor and wall tiles' },
    { name: 'cement', displayName: 'Cement', description: 'Cement and mortar products' },
    { name: 'jali', displayName: 'Jali', description: 'Decorative jali screens' },
    { name: 'sanitaryware', displayName: 'Sanitaryware', description: 'Bathroom fixtures and fittings' },
    { name: 'accessories', displayName: 'Accessories', description: 'Bathroom and plumbing accessories' },
    { name: 'pipes', displayName: 'Pipes', description: 'PVC and plumbing pipes' },
    { name: 'fittings', displayName: 'Fittings', description: 'Pipe fittings and connectors' },
    { name: 'taps', displayName: 'Taps & Faucets', description: 'Water taps and faucets' },
    { name: 'showers', displayName: 'Showers', description: 'Shower heads and systems' },
    { name: 'other', displayName: 'Other', description: 'Miscellaneous items' }
];

const seedCategories = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        for (const catData of defaultCategories) {
            const existingCategory = await Category.findOne({ name: catData.name });

            if (!existingCategory) {
                const category = new Category(catData);
                await category.save();
                console.log(`✅ Created category: ${catData.displayName}`);
            } else {
                console.log(`⏭️  Category already exists: ${catData.displayName}`);
            }
        }

        console.log('\n=== Default Categories Seeded ===\n');

        await mongoose.disconnect();
        console.log('Done!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding categories:', error);
        process.exit(1);
    }
};

seedCategories();
