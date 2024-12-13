const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        minlength: 3
    }
})

categorySchema.pre('save', function (next) {
    if (this.name) {
        this.name = this.name.trim().toLowerCase();
    }
    next();
})

module.exports = mongoose.model('Category', categorySchema)