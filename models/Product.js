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

productSchema.pre('save', async function (next) {
    if (this.isModified('category')) {
        const Category = mongoose.model('Category');
        const categoryExists = await Category.findById(this.category);
        if (!categoryExists) {
            const err = new Error('Category does not exist');
            return next(err);
        }
    }
    next();
});

productSchema.pre('findOneAndUpdate', async function (next) {
    const update = this.getUpdate();
    if (update && update.category) {
        const Category = mongoose.model('Category');
        const categoryExists = await Category.findById(update.category);
        if (!categoryExists) {
            const err = new Error('Category does not exist');
            return next(err);
        }
    }
    next();
});

module.exports = mongoose.model('Product', productSchema);
