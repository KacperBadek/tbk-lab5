const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

router.get('/', async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (err) {
        console.error('Error in fetching categories:', err);
        res.status(500).json({error: 'Internal server error'});
    }
});

router.post('/', async (req, res) => {
    const {name} = req.body;

    try {
        const newCategory = new Category({name});
        await newCategory.save();
        res.status(201).json(newCategory);
    } catch (err) {
        console.error('Error in creating category:', err);
        res.status(500).json({error: 'Internal server error'});
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const {id} = req.params;
        const deletedCategory = await Category.findByIdAndDelete(id);

        if (!deletedCategory) {
            return res.status(404).json({message: `No category with id ${req.params.id} found.`})
        }

        res.status(200).json({message: 'Product deleted successfully', category: deletedCategory});
    } catch (error) {
        res.status(500).json({error: "Failed to delete product"});
    }
})


module.exports = router;
