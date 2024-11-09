const express = require('express');
const app = express();
const fs = require("node:fs");
const path = require('path');
const errorHandler = require('../error-handling/errorHandler');
const notFoundHandler = require('../error-handling/notFoundHandler');

const checkAuth = (req, res, next) => {

    const authHeader = req.headers['authorization'];

    if (!authHeader || authHeader !== 'admin') {
        return res.status(403).send('Dostęp zabroniony');
    }
    next();
}

app.use(express.static(path.join(__dirname, '../public')));

app.use((req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.url} ${duration}ms`);
    })
    next();
})

app.use('/admin', checkAuth);

app.get('/', (req, res) => {
    res.send('Witaj w aplikacji Express.js!');
})

app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
})

app.get('/products', (req, res) => {
    try {
        const filePath = path.join(__dirname, '../data/products.json');
        const products = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        res.json(products);
    } catch (err) {
        console.error("Error reading or parsing products.json:", err);
        res.status(500).json({error: "Failed to load products data"});
    }
});

app.get('/admin', (req, res) => {
    res.send('Witaj w panelu admina!');
})

app.get('/error', (req, res) => {
    throw new Error("aha");
})

app.get('/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const filePath = path.join(__dirname, '../data/products.json');
    const products = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    const product = products.find(product => product.id === productId)
    if (!product) {
        res.status(404).json({
            message: `No product with id ${productId} found.`
        })
    }
    res.json(product);


})

app.get('/search', (req, res) => {
    const {category, maxPrice} = req.query;
    const filePath = path.join(__dirname, '../data/products.json');
    const products = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    const filteredProducts = products.filter(product => {
        return (
            (!category || product.category === category) &&
            (!maxPrice || product.unitPrice <= parseFloat(maxPrice))
        );
    });
    if (filteredProducts.length === 0) {
        res.status(404).json({message: "Brak takich produktów"})
    }
    res.json(filteredProducts);
})

app.use(notFoundHandler)
app.use(errorHandler)

const PORT = 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));