require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import routes
const scrapeRoutes = require('./routes/scrape.routes');
const contactsRoutes = require('./routes/contacts.routes');
const historyRoutes = require('./routes/history.routes');
const aiRoutes = require('./routes/ai.routes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

const errorMiddleware = require('./middlewares/error.middleware');

// Routes
app.use('/api/scrape', scrapeRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/ai', aiRoutes);

// Global Error Handler MUST be the last middleware
app.use(errorMiddleware);

module.exports = app;
