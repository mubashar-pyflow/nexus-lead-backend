const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres:nexus-leads@123@db.nwxigqjsubaoeupaoyaq.supabase.co:5432/postgres';

const client = new Client({
  connectionString,
});

async function migrate() {
  try {
    await client.connect();
    console.log('Connected to Supabase DB.');
    
    // Read the schema file
    const schemaDir = '/Users/macbook/.gemini/antigravity/brain/031a10ab-515d-4699-94ae-918a6be8c5a8/scratch/supabase_schema.sql';
    const sql = fs.readFileSync(schemaDir, 'utf8');
    
    await client.query(sql);
    console.log('Migration successful!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}

migrate();
