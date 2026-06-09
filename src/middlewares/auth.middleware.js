const { createClient } = require('@supabase/supabase-js');

const supabaseMiddleware = (req, res, next) => {
    require('fs').appendFileSync('debug.log', `Middleware hit for ${req.method} ${req.originalUrl}\n`);
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        require('fs').appendFileSync('debug.log', `Unauthorized: No token provided\n`);
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    
    req.supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY,
        {
            global: {
                headers: {
                    Authorization: authHeader
                }
            }
        }
    );
    next();
};

module.exports = supabaseMiddleware;
