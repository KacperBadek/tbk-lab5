const express = require('express');
const app = express();
const fs = require("node:fs");
const bodyParser = require('body-parser');
const path = require('path');
const errorHandler = require('../error-handling/errorHandler');
const notFoundHandler = require('../error-handling/notFoundHandler');
const productsRouter = require('../routes/products');
const swaggerUi = require("swagger-ui-express");


app.use((req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.url} ${duration}ms`);
    })
    next();
})

app.use(bodyParser.json());
app.use('/products', productsRouter)
app.use(express.static(path.join(__dirname, '../public')));

const swaggerDocument = require("../swagger_output.json");
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req, res) => {
    res.send('Witaj w aplikacji Express.js!');
})

app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
})

app.use(notFoundHandler)
app.use(errorHandler)

const PORT = 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));