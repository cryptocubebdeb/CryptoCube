import { Pool } from "pg";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // ssl: { rejectUnauthorized: false } // Uncomment if using school server
});

export default pool;