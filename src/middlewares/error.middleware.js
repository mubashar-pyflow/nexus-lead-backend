// Global Error Handling Middleware
const errorMiddleware = (err, req, res, next) => {
    require('fs').appendFileSync('debug.log', `[ERROR] ${new Date().toISOString()} - ${err.stack}\n`);

    // Default to 500 server error
    const status = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(status).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = errorMiddleware;
