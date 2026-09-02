const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const CONN = 'postgresql://neondb_owner:npg_TXrGhtb0o2xQ@ep-gentle-hall-acx4z3si-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require';

async function run() {
  const pool = new Pool({ connectionString: CONN });
  const client = await pool.connect();
  
  try {
    const migration = fs.readFileSync(path.join(__dirname, '..', 'neon_migration.sql'), 'utf8');
    console.log('Running migration...');
    await client.query(migration);
    console.log('Migration executed successfully!');
    
    // Verify tables
    const res = await client.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename");
    console.log('\nTables created:');
    res.rows.forEach(r => console.log('  -', r.tablename));
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
