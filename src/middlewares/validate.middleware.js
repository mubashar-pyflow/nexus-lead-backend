const { z } = require('zod');

// Middleware factory for validating request bodies, queries, or params
const validate = (schema, property = 'body') => {
    return (req, res, next) => {
        try {
            const result = schema.parse(req[property]);
            req[property] = result; // Reassign sanitized data
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    issues: error.errors.map(err => ({ path: err.path.join('.'), message: err.message }))
                });
            }
            next(error);
        }
    };
};

module.exports = validate;
