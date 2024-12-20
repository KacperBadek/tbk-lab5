const express = require('express');
const fs = require("node:fs");
const path = require('path');
const {check, validationResult} = require('express-validator');
const router = express.Router();
const Product = require('../models/Product')
const Category = require('../models/Category')

const productValidationRules = [
    check('name').isString().withMessage('Name is required')
        .isLength({min: 3}).withMessage('Name must be at least 3 characters long')
        .notEmpty().withMessage('Name is required'),
    check('category').isString().withMessage('Category must be a string')
        .notEmpty().withMessage('Category is required'),
    check('quantity').isInt({gt: 0}).withMessage('Quantity must be a positive integer')
        .notEmpty().withMessage('Quantity is required'),
    check('unitPrice').isFloat({gt: 0}).withMessage('Unit Price must be a positive number')
        .notEmpty().withMessage('Unit Price is required'),
    check('description').isString().withMessage('Description must be a string')
        .isLength({min: 3}).withMessage('Description must be at least 3 characters long')
        .notEmpty().withMessage('Description is required'),
    check('dateAdded').isISO8601().withMessage('Date Added must be a valid date')
        .notEmpty().withMessage('Date Added is required'),
    check('supplier').isString().withMessage('Supplier must be a string')
        .isLength({min: 3}).withMessage('Supplier must be at least 3 characters long')
        .notEmpty().withMessage('Supplier is required')
];

const patchValidation = [
    check('name').optional().isString().isLength({min: 3}).withMessage('Name must be at least 3 characters long'),
    check('category').optional().isMongoId().withMessage('Category must be a valid ID'),
    check('quantity').optional().isInt({gt: 0}).withMessage('Quantity must be a positive integer'),
    check('unitPrice').optional().isFloat({gt: 0}).withMessage('Unit Price must be a positive number'),
    check('description').optional().isString().isLength({min: 3}).withMessage('Description must be at least 3 characters long'),
    check('dateAdded').optional().isISO8601().withMessage('Date Added must be a valid date'),
    check('supplier').optional().isString().isLength({min: 3}).withMessage('Supplier must be at least 3 characters long')
]

router.get('/', async (req, res) => {
    try {
        const products = await Product.find().populate('category', 'name');
        res.json(products);
    } catch (err) {
        res.status(500).json({error: 'Failed to load products data'});
    }
})

router.get('/search', async (req, res) => {
    const {category, minPrice, maxPrice, supplier} = req.query;

    try {
        const filter = {};
        if (category) filter.category = category;
        if (minPrice) filter.unitPrice = {$gte: parseFloat(minPrice)};
        if (maxPrice) filter.unitPrice = {...filter.unitPrice, $lte: parseFloat(maxPrice)};
        if (supplier) filter.supplier = supplier;

        const products = await Product.find(filter).populate('category', 'name');
        if (products.length === 0) {
            return res.status(404).json({message: 'No products found'});
        }
        res.json(products);
    } catch (err) {
        res.status(500).json({error: 'Failed to search products'});
    }
})

router.get('/total-price', async (req, res) => {
    try {
        const result = await Product.aggregate([{
            $group: {
                _id: null,
                totalPrice: {
                    $sum: {
                        $multiply: ['$unitPrice', '$quantity']
                    }
                }
            }
        }])

        if (result.length === 0) {
            return res.status(404).json({message: 'No products found'});
        }

        res.json(result);
    } catch (error) {
        res.status(500).json({error: 'Failed to retrieve total price'});
    }
})


router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category', 'name');
        if (!product) {
            return res.status(404).json({message: `No product with id ${req.params.id} found.`});
        }
        res.json(product);
    } catch (err) {
        res.status(500).json({error: 'Failed to retrieve product'});
    }
})


router.post('/', productValidationRules, async (req, res) => {
    try {
        const newProductData = req.body;
        let category = await Category.findOne({name: newProductData.category});
        if (!category) {
            return res.status(404).json({message: `No category with name ${newProductData.category} found.`});
        }

        const productToSave = new Product({
            ...newProductData,
            category: category._id,
        });

        await productToSave.save();
        res.status(201).json(productToSave);
    } catch (err) {
        console.error('Error in creating product:', err);
        res.status(500).json({error: 'Internal server error'});
    }
})


router.put('/:id', productValidationRules, async (req, res) => {
    try {
        const {id} = req.params;
        const updatedProductData = req.body;

        let category = await Category.findOne({name: updatedProductData.category});
        if (!category) {
            return res.status(404).json({message: `No category with name ${updatedProductData.category} found.`});
        }

        const updateData = {
            name: updatedProductData.name,
            category: category._id,
            quantity: updatedProductData.quantity,
            unitPrice: updatedProductData.unitPrice,
            description: updatedProductData.description,
            dateAdded: updatedProductData.dateAdded,
            supplier: updatedProductData.supplier
        };

        const updatedProduct = await Product.findByIdAndUpdate(
            id, updateData,
            {new: true, runValidators: true}
        );

        if (!updatedProduct) {
            return res.status(404).json({message: `No product with id ${id} found.`});
        }

        res.status(200).json(updatedProduct);
    } catch (error) {
        console.log('Error in updating product:', error);
        res.status(500).json({error: 'Internal server error'});
    }
})


router.patch('/:id', patchValidation, async (req, res) => {
    try {
        const {id} = req.params;
        const updatedProductData = req.body;

        let category;
        if (updatedProductData.category) {
            category = await Category.findOne({name: updatedProductData.category});
            if (!category) {
                return res.status(404).json({message: `No category with name ${updatedProductData.category} found.`});
            }
            updatedProductData.category = category._id;
        }

        const updatedProduct = await Product.findByIdAndUpdate(id, updatedProductData, {
            new: true,
            runValidators: true
        });

        if (!updatedProduct) {
            return res.status(404).json({message: `No product with id ${id} found.`});
        }

        res.json(updatedProduct);
    } catch (err) {
        console.error('Error in patching product:', err);
        res.status(500).json({error: 'Internal server error'});
    }
})

router.delete('/:id', async (req, res) => {

    try {
        const {id} = req.params;
        const deletedProduct = await Product.findByIdAndDelete(id);
        if (!deletedProduct) {
            return res.status(404).json({message: `No product with id ${req.params.id} found.`})
        }

        res.status(200).send({message: 'Product deleted successfully', product: deletedProduct});
    } catch (error) {
        res.status(500).json({error: "Failed to delete product"});
    }
})

module.exports = router
