import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let pool;

export async function getDb() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    
    if (!connectionString) {
      console.warn("⚠️ DATABASE_URL or POSTGRES_URL is not set. Defaulting to local postgres.");
    }

    pool = new Pool({
      connectionString: connectionString || 'postgresql://postgres:postgres@localhost:5432/meditrack',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    try {
      // Test the connection
      await pool.query('SELECT 1');
      console.log('📦 Connected to PostgreSQL database');
      
      // We do not run the schema script on every request/startup for a cloud database
      // The schema must be applied via a migration or a manual seed script.
    } catch (err) {
      console.error('❌ Failed to connect to PostgreSQL:', err.message);
      throw err;
    }
  }
  return pool;
}
