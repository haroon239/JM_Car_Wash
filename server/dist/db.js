import pg from "pg";
import dotenv from "dotenv";
dotenv.config({ path: new URL("../../.env", import.meta.url) });
const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;
export const pool = connectionString
    ? new Pool({ connectionString })
    : null;
export async function checkDatabase() {
    if (!pool)
        return false;
    await pool.query("SELECT 1");
    return true;
}
