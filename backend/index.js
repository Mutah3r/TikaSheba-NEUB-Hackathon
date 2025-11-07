const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
dotenv.config({ path: './.env' });
mongoose.connect(process.env.MONGO_URI);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// app.use('/api/auth', require('./routes/auth'));
app.get('/api', (req, res) => {
  res.send('Hello World!');
});

// Swagger setup
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TikaSheba API DOCUMENTATION',
      version: '1.0.0',
      description: 'API documentation for TikaSheba backend services',
    },
    servers: [{ url: 'http://localhost:8000' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
        },
      },
    },
  },
  apis: ['./routes/*.js'],
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/authority', require('./routes/authority'));
app.use('/api/vacc_centre', require('./routes/vacc_centre'));
app.use('/api/citizen', require('./routes/citizen'));
app.use('/api/staff', require('./routes/staff'));

app.listen(8000, () => {
  console.log('Server is running on port 8000');
});