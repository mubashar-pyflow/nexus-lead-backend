require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import routes
const scrapeRoutes = require('./routes/scrape.routes');
const contactsRoutes = require('./routes/contacts.routes');
const historyRoutes = require('./routes/history.routes');
const aiRoutes = require('./routes/ai.routes');

const app = express();

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

// Middlewares
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('CORS not allowed'));
    }
}));
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
