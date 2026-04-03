import { Pool } from 'pg';
let pool = null;
export function initializePool() {
    if (!pool) {
        const databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl) {
            throw new Error('DATABASE_URL environment variable is not set');
        }
        pool = new Pool({
            connectionString: databaseUrl,
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });
        pool.on('error', (err) => {
            console.error('Unexpected error on idle client', err);
        });
    }
    return pool;
}
export async function getConnection() {
    const pool = initializePool();
    return pool.connect();
}
export async function query(text, params) {
    const pool = initializePool();
    return pool.query(text, params);
}
export async function close() {
    if (pool) {
        await pool.end();
        pool = null;
    }
}
