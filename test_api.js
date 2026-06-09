const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supa = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function test() {
    const { data: auth, error } = await supa.auth.signInWithPassword({
        // Do I know a user? I will just create a random user!
        email: 'test_agent@example.com',
        password: 'password123'
    });
    
    let token = auth?.session?.access_token;
    
    if (error || !token) {
        console.log("Signup needed...");
        const res = await supa.auth.signUp({ email: 'test_agent@example.com', password: 'password123' });
        token = res.data?.session?.access_token;
        if(!token) { console.error("auth failed", res.error); return; }
    }

    console.log("Got token length:", token.length);

    try {
        const res = await fetch('http://localhost:3001/api/history/search', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: 'sh-12345',
                category: 'test',
                location: 'test',
                count: 5,
                timestamp: new Date().toISOString()
            })
        });

        console.log("Status:", res.status);
        console.log("Body:", await res.text());
        
        // Also let's check debug.log!
        const fs = require('fs');
        if(fs.existsSync('debug.log')) {
            console.log("DEBUG LOG:", fs.readFileSync('debug.log', 'utf8'));
        } else {
            console.log("No debug.log found");
        }
    } catch(e) {
        console.error("Fetch error:", e);
    }
}
test();
