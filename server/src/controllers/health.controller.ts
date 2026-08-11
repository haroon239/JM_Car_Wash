import type { Request, Response } from "express";
import { isDatabaseConnected } from "../config/database.js";
import { billingMaintenanceStatus } from "../services/billing.service.js";

export async function healthCheck(_request: Request, response: Response) {
  let database = false;
  try {
    database = await isDatabaseConnected();
  } catch {
    database = false;
  }
  response.json({
    ok: database,
    service: "jm-car-wash-api",
    database,
    billing: billingMaintenanceStatus,
  });
}
