const express = require('express');
const app = express();
const mongoose = require('mongoose')
const MONGO_URI = 'mongodb://root:example@localhost:27017/products?authSource=admin';
const cors = require('cors');
const fs = require("node:fs");
const YAML = require('yamljs');
const bodyParser = require('body-parser');
const path = require('path');
const errorHandler = require('../error-handling/errorHandler');
const notFoundHandler = require('../error-handling/notFoundHandler');
const productsRouter = require('../routes/products');
const categoryRouter = require('../routes/category')
const swaggerUi = require("swagger-ui-express");

const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

mongoose.connect(MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log("Connected to mongoDB"))
    .catch(er => console.log("Failed", er))

app.use((req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.url} ${duration}ms`);
    })
    next();
})

app.use((req, res, next) => {
    const originalJson = res.json.bind(res); //.bind to kopia metody res.json
    res.json = (data) => { //zmieniamy res.json na fukcje
        if (Array.isArray(data)) {
            data = data.map(item => ({...item, timestamp: new Date().toISOString()}));
        } else if (typeof data === 'object' && data !== null) {
            data.timestamp = new Date().toISOString();
        }
        originalJson(data); //wywołujemy funkcje
    };
    next();
});

app.use(express.json());


app.use((req, res, next) => {
    if (req.body && typeof req.body === 'object') {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = req.body[key].toLowerCase();
            }
        });
    }
    next();
});

app.use('/products', productsRouter)
app.use('/categories', categoryRouter)
app.use(express.static(path.join(__dirname, '../public')));


//const swaggerDocument = require("../swagger_output.json");
const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req, res) => {
    res.send('Witaj w aplikacji Express.js!');
})

app.use(notFoundHandler)
app.use(errorHandler)

const PORT = 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));