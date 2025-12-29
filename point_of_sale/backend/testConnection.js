require('dotenv').config();
const mongoose = require('mongoose');

console.log('Testing MongoDB Atlas connection...');

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('✅ MongoDB Atlas Connected Successfully!');
        process.exit(0);
    })
    .catch(err => {
        console.log('❌ Connection Failed:', err.message);
        process.exit(1);
    });
