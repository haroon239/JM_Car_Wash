import dotenv from "dotenv";

dotenv.config({ path: new URL("../../../.env", import.meta.url), quiet: true });

export const env = {
  port: Number(process.env.PORT ?? 4000),
  clientUrl: process.env.CLIENT_URL ?? "http://localhost:5173",
  databaseUrl: process.env.DATABASE_URL ?? ""
};
