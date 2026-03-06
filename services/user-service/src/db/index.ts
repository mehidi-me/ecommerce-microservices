import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const runMigrations = async (): Promise<void> => {
    const client = await pool.connect();
    try {
        const sql = fs.readFileSync(
            path.join(__dirname, 'migrations', '001_create_profiles.sql'),
            'utf-8'
        );
        await client.query(sql);
        console.log('✅ User service migrations complete');
    } finally {
        client.release();
    }
};

export default pool;
