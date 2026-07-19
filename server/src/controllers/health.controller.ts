import type { Request, Response } from "express";
import { isDatabaseConnected } from "../config/database.js";

export async function healthCheck(_request: Request, response: Response) {
  let database = false;
  try { database = await isDatabaseConnected(); } catch { database = false; }
  response.json({ ok: true, service: "jm-car-wash-api", database });
}
