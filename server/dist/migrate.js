import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import pg from "pg";
dotenv.config({ path: new URL("../../.env", import.meta.url) });
const connectionString = process.env.DATABASE_URL;
if (!connectionString)
    throw new Error("DATABASE_URL is not configured");
const sqlPaths = [
    fileURLToPath(new URL("../sql/001_initial.sql", import.meta.url)),
    fileURLToPath(new URL("../sql/002_customer_plan_start_date.sql", import.meta.url)),
    fileURLToPath(new URL("../sql/003_payments.sql", import.meta.url))
];
const client = new pg.Client({ connectionString });
try {
    await client.connect();
    await client.query("BEGIN");
    for (const sqlPath of sqlPaths)
        await client.query(await readFile(sqlPath, "utf8"));
    await client.query("COMMIT");
    console.log("Database migration completed successfully.");
}
catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
}
finally {
    await client.end();
}
