const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true,
        lowercase: true
    },
    sku: {
        type: String,
        required: [true, 'SKU is required'],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    unit: {
        type: String,
        required: [true, 'Unit is required'],
        enum: ['piece', 'box', 'bag', 'sq_ft', 'sq_meter', 'kg'],
        default: 'piece'
    },
    purchasePrice: {
        type: Number,
        required: [true, 'Purchase price is required'],
        min: 0
    },
    sellingPrice: {
        type: Number,
        required: [true, 'Selling price is required'],
        min: 0
    },
    stock: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    minStockLevel: {
        type: Number,
        default: 10,
        min: 0
    },
    maxStockLevel: {
        type: Number,
        default: 1000,
        min: 0
    },
    supplier: {
        name: String,
        contact: String,
        email: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    imageUrl: {
        type: String
    }
}, {
    timestamps: true
});

// Virtual for stock status
productSchema.virtual('stockStatus').get(function () {
    if (this.stock === 0) return 'out_of_stock';
    if (this.stock <= this.minStockLevel) return 'low_stock';
    if (this.stock >= this.maxStockLevel) return 'overstock';
    return 'in_stock';
});

// Ensure virtuals are included in JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
