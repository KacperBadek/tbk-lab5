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

module.exports = router;
