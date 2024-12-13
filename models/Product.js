const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {type: String, required: true, minlength: 3},
    category: {type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true},
    quantity: {type: Number, required: true, min: 1},
    unitPrice: {type: Number, required: true, min: 0},
    description: {type: String, required: true, minlength: 3},
    dateAdded: {type: Date, required: true, default: Date.now},
    supplier: {type: String, required: true, minlength: 3}
});

productSchema.pre('save', function (next) {
    if (this.name) {
        this.name = this.name.trim().toLowerCase();
    }
    if (this.supplier) {
        this.supplier = this.supplier.trim();
    }
    next();
});

module.exports = mongoose.model('Product', productSchema);
