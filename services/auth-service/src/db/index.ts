import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const runMigrations = async (): Promise<void> => {
    const client = await pool.connect();
    try {
        const migrationPath = path.join(__dirname, 'migrations', '001_create_users.sql');
        const sql = fs.readFileSync(migrationPath, 'utf-8');
        await client.query(sql);
        console.log('✅ Auth service migrations complete');
    } catch (err) {
        console.error('❌ Migration failed:', err);
        throw err;
    } finally {
        client.release();
    }
};

export default pool;
