import type { Request, Response } from "express";
import * as customerModel from "../models/customer.model.js";
import { customerSchema, idSchema } from "../validators/customer.schema.js";

export async function listCustomers(request: Request, response: Response) {
  const view = request.query.view === "archived" ? "archived" : request.query.view === "all" ? "all" : "active";
  response.json(await customerModel.findCustomers(view));
}
export async function createCustomer(request: Request, response: Response) { response.status(201).json(await customerModel.createCustomer(customerSchema.parse(request.body))); }
export async function updateCustomer(request: Request, response: Response) {
  const result = await customerModel.updateCustomer(idSchema.parse(request.params.id), customerSchema.parse(request.body));
  if (!result) throw Object.assign(new Error("Customer not found"), { status: 404 });
  response.json(result);
}
export async function archiveCustomer(request: Request, response: Response) {
  if (!await customerModel.archiveCustomer(idSchema.parse(request.params.id))) throw Object.assign(new Error("Customer not found"), { status: 404 });
  response.status(204).send();
}
export async function restoreCustomer(request: Request, response: Response) {
  const result = await customerModel.restoreCustomer(idSchema.parse(request.params.id));
  if (!result) throw Object.assign(new Error("Archived customer not found"), { status: 404 });
  response.json({ id: result.id, restored: true });
}
