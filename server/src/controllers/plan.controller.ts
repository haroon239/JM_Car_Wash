import type { Request, Response } from "express";
import * as planModel from "../models/plan.model.js";
import { idSchema } from "../validators/customer.schema.js";
import { planSchema } from "../validators/plan.schema.js";

export async function listPlans(_request: Request, response: Response) { response.json(await planModel.findPlans()); }
export async function createPlan(request: Request, response: Response) { response.status(201).json(await planModel.createPlan(planSchema.parse(request.body))); }
export async function updatePlan(request: Request, response: Response) {
  const result = await planModel.updatePlan(idSchema.parse(request.params.id), planSchema.parse(request.body));
  if (!result) throw Object.assign(new Error("Plan not found"), { status: 404 });
  response.json(result);
}
export async function deactivatePlan(request: Request, response: Response) {
  if (!await planModel.deactivatePlan(idSchema.parse(request.params.id))) throw Object.assign(new Error("Plan not found"), { status: 404 });
  response.status(204).send();
}
