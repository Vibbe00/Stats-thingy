import { Pool } from 'pg';
import { config } from '../config';

export const db = new Pool ({ connectionString: config.databaseUrl });

db.on('error', (err) => {
    console.error("[DB] Unexpected pool error:", err.message);
});

// Connection test on startup
export async function connectDB(): Promise<void> {
    const client = await db.connect();
    client.release();
    console.log("[DB] Connected");
}