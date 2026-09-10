import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let pool;

export function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is required. Please set it in your .env file.\nExample: DATABASE_URL=postgresql://postgres:password@localhost:5432/meditalk');
    }
    pool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    pool.on('error', (err) => {
      console.error('[DB] Unexpected error on idle client', err);
    });

    console.log('🐘 Connected to PostgreSQL');
  }
  return pool;
}

// Convenience wrapper — returns full pg QueryResult
export async function query(text, params) {
  const p = getPool();
  return p.query(text, params);
}

// Run schema SQL on startup (idempotent CREATE TABLE IF NOT EXISTS)
export async function initDb() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  const p = getPool();
  await p.query(schemaSql);
  console.log('📋 Database schema initialized');
}
