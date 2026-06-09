exports.getContacts = async (req, res) => {
    const { data, error } = await req.supabase.from('saved_contacts').select('*').order('created_at', { ascending: false });
    if (error) return res.status(400).json({ error });
    res.json(data.map(row => ({ ...row.data, id: row.id })));
};

exports.saveContact = async (req, res) => {
    const { id, ...contactData } = req.body;
    const { data: userResp, error: userErr } = await req.supabase.auth.getUser(req.headers.authorization.split(' ')[1]);
    if (userErr || !userResp?.user) return res.status(401).json({ error: 'Invalid user' });

    const { error } = await req.supabase.from('saved_contacts').upsert({
        id: id,
        user_id: userResp.user.id,
        data: contactData
    });
    if (error) return res.status(400).json({ error });
    res.json({ success: true });
};

exports.deleteContact = async (req, res) => {
    const { error } = await req.supabase.from('saved_contacts').delete().match({ id: req.params.id });
    if (error) return res.status(400).json({ error });
    res.json({ success: true });
};
