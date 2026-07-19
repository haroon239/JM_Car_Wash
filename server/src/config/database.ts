import pg from "pg";
import { env } from "./env.js";

export const pool = env.databaseUrl ? new pg.Pool({ connectionString: env.databaseUrl }) : null;

export function requireDatabase() {
  if (!pool) throw Object.assign(new Error("DATABASE_URL is not configured"), { status: 503 });
  return pool;
}

export async function isDatabaseConnected() {
  if (!pool) return false;
  await pool.query("SELECT 1");
  return true;
}
