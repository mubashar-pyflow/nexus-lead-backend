// --- Search History ---
exports.getSearchHistory = async (req, res) => {
    const { data, error } = await req.supabase.from('search_history').select('*').order('created_at', { ascending: false });
    if (error) return res.status(400).json({ error });
    res.json(data.map(row => ({ ...row.data, id: row.id })));
};

exports.addSearchHistory = async (req, res) => {
    try {
        const { id, ...searchData } = req.body;
        require('fs').appendFileSync('debug.log', `addSearchHistory called with body: ${JSON.stringify(req.body)}\n`);
        const { data: userResp } = await req.supabase.auth.getUser(req.headers.authorization.split(' ')[1]);
        
        if (!userResp?.user) {
            require('fs').appendFileSync('debug.log', `Invalid user\n`);
            return res.status(401).json({ error: 'Invalid user' });
        }

        const { error } = await req.supabase.from('search_history').insert({
            id: id,
            user_id: userResp.user.id,
            data: searchData
        });
        if (error) {
            require('fs').appendFileSync('debug.log', `Insert error: ${JSON.stringify(error)}\n`);
            return res.status(400).json({ error });
        }
        res.json({ success: true });
    } catch(err) {
        require('fs').appendFileSync('debug.log', `Exception: ${err}\n`);
        res.status(500).json({ error: 'Exception' });
    }
};

exports.clearSearchHistory = async (req, res) => {
    const { data: userResp } = await req.supabase.auth.getUser(req.headers.authorization.split(' ')[1]);
    if (!userResp?.user) return res.status(401).json({ error: 'Invalid user' });

    const { error } = await req.supabase.from('search_history').delete().match({ user_id: userResp.user.id });
    if (error) return res.status(400).json({ error });
    res.json({ success: true });
};

exports.removeSearchHistory = async (req, res) => {
    const { id } = req.params;
    const { data: userResp } = await req.supabase.auth.getUser(req.headers.authorization.split(' ')[1]);
    if (!userResp?.user) return res.status(401).json({ error: 'Invalid user' });

    const { error } = await req.supabase.from('search_history').delete().match({ id, user_id: userResp.user.id });
    if (error) return res.status(400).json({ error });
    res.json({ success: true });
};

// --- Export History ---
exports.getExportHistory = async (req, res) => {
    const { data, error } = await req.supabase.from('export_history').select('*').order('created_at', { ascending: false });
    if (error) return res.status(400).json({ error });
    res.json(data.map(row => ({ ...row.data, id: row.id })));
};

exports.addExportHistory = async (req, res) => {
    const { id, ...exportData } = req.body;
    const { data: userResp } = await req.supabase.auth.getUser(req.headers.authorization.split(' ')[1]);
    
    if (!userResp?.user) return res.status(401).json({ error: 'Invalid user' });

    const { error } = await req.supabase.from('export_history').insert({
        id: id,
        user_id: userResp.user.id,
        data: exportData
    });
    if (error) return res.status(400).json({ error });
    res.json({ success: true });
};

exports.clearExportHistory = async (req, res) => {
    const { data: userResp } = await req.supabase.auth.getUser(req.headers.authorization.split(' ')[1]);
    if (!userResp?.user) return res.status(401).json({ error: 'Invalid user' });

    const { error } = await req.supabase.from('export_history').delete().match({ user_id: userResp.user.id });
    if (error) return res.status(400).json({ error });
    res.json({ success: true });
};
