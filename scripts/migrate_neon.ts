import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONN = 'postgresql://neondb_owner:npg_TXrGhtb0o2xQ@ep-gentle-hall-acx4z3si-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require';

const sql = neon(CONN);

// Read the full migration SQL
const migration = readFileSync(join(__dirname, '..', 'neon_migration.sql'), 'utf8');

// Execute as a single raw query using Neon's tagged template
// We need to use sql.unsafe() or similar for raw SQL
async function run() {
  try {
    // Use the query method which accepts raw SQL strings
    await (sql as any).query(migration);
    console.log('Migration executed successfully!');
  } catch (err: any) {
    console.error('Error:', err.message);
    
    // Fallback: try executing statement by statement using pg
    console.log('\nTrying statement by statement...');
    const { Pool } = await import('@neondatabase/serverless');
    const pool = new Pool({ connectionString: CONN });
    const client = await pool.connect();
    
    try {
      await client.query(migration);
      console.log('Migration executed successfully via Pool!');
    } catch (err2: any) {
      console.error('Pool error:', err2.message);
    } finally {
      client.release();
      await pool.end();
    }
  }
}

run();
