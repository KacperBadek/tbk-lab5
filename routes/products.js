const express = require('express');
const fs = require("node:fs");
const path = require('path');
const router = express.Router();

const getProducts = () => {
    const filePath = path.join(__dirname, '../data/products.json');
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

const saveProducts = (products) => {
    const filePath = path.join(__dirname, '../data/products.json');
    fs.writeFileSync(filePath, JSON.stringify(products, null, 2), 'utf8');
};

router.get('/', (req, res) => {
    try {
        const products = getProducts();
        res.json(products);
    } catch (err) {
        res.status(500).json({error: "Failed to load products data"});
    }
})

router.get('/search', (req, res) => {
    const {category, minPrice, maxPrice, supplier} = req.query;
    const products = getProducts();

    const filteredProducts = products.filter(product => {
        return (
            (!category || product.category === category) &&
            (!minPrice || product.unitPrice >= parseFloat(minPrice)) &&
            (!maxPrice || product.unitPrice <= parseFloat(maxPrice)) &&
            (!supplier || product.supplier === supplier)
        );
    });
    if (filteredProducts.length === 0) {
        res.status(404).json({message: "Brak takich produktów"})
    }
    res.json(filteredProducts);
})


router.get('/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const products = getProducts();

    const product = products.find(product => product.id === productId)
    if (!product) {
        res.status(404).json({
            message: `No product with id ${productId} found.`
        })
    }
    res.json(product);
})


router.post('/', (req, res) => {
    try {
        const {name, category, quantity, unitPrice, description, dateAdded, supplier} = req.body;
        if (!name || !category || !quantity || !unitPrice || !description || !dateAdded || !supplier) {
            return res.status(400).json({error: "All fields are required"});
        }

        const products = getProducts();
        const lastId = products.length > 0 ? products[products.length - 1].id : 0;
        const newProduct = {id: lastId + 1, name, category, quantity, unitPrice, description, dateAdded, supplier};

        products.push(newProduct);
        saveProducts(products);

        res.status(201).json(newProduct);
    } catch (err) {
        console.error("Error in POST /products:", err);
        res.status(500).json({error: "Failed to add product"});
    }
})


router.put('/:id', (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const products = getProducts();
        const {name, category, quantity, unitPrice, description, dateAdded, supplier} = req.body;

        if (!name || !category || !quantity || !unitPrice || !description || !dateAdded || !supplier) {
            return res.status(400).json({error: "All fields are required"});
        }

        const productIndex = products.findIndex(product => product.id === productId);

        if (productIndex === -1) {
            return res.status(404).json({
                message: `No product with id ${productId} found.`
            });
        }

        products[productIndex] = {
            id: productId,
            name,
            category,
            quantity,
            unitPrice,
            description,
            dateAdded,
            supplier
        };

        saveProducts(products);
        res.status(200).json(products[productIndex]);
    } catch (err) {
        res.status(500).json({error: "Failed to edit product"});
    }
})


router.patch('/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const updatedProduct = req.body;
    const products = getProducts();


    const product = products.find(product => product.id === productId);
    if (!product) {
        return res.status(404).json({message: `No product with id ${productId} found.`});
    }

    Object.assign(product, updatedProduct);
    saveProducts(products);
})

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Usuń produkt po ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID produktu
 *     responses:
 *       200:
 *         description: Produkt usunięty pomyślnie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Produkt nie znaleziony
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.delete('/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const products = getProducts();

    const filteredProducts = products.filter(product => product.id !== productId);
    if (filteredProducts.length === products.length) {
        return res.status(404).json({message: `No product with id ${productId} found.`});
    }

    saveProducts(filteredProducts);
    res.status(204).send();
})

module.exports = router
