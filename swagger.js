const swaggerAutogen = require('swagger-autogen')();

const doc = {
    info: {
        title: 'Product API',
        description: 'API do zarządzania produktami'
    },
    host: 'localhost:3000',
    schemes: ['http'],
};

const outputFile = './swagger_output.json';
const endpointsFiles = ['./controllers/server.js'];

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
    require('./controllers/server')
});