import type { Request, Response } from "express";
import * as customerModel from "../models/customer.model.js";
import * as activityModel from "../models/activity.model.js";
import { customerSchema, idSchema } from "../validators/customer.schema.js";

export async function listCustomers(request: Request, response: Response) {
  const view =
    request.query.view === "archived"
      ? "archived"
      : request.query.view === "all"
        ? "all"
        : "active";
  response.json(await customerModel.findCustomers(view));
}
export async function createCustomer(request: Request, response: Response) {
  const result = await customerModel.createCustomer(customerSchema.parse(request.body));
  await activityModel.logCustomerActivity(
    Number(result.id),
    "customer_created",
    "Customer added",
    "Customer account and subscription created.",
  );
  response.status(201).json(result);
}
export async function updateCustomer(request: Request, response: Response) {
  const result = await customerModel.updateCustomer(
    idSchema.parse(request.params.id),
    customerSchema.parse(request.body),
  );
  if (!result) throw Object.assign(new Error("Customer not found"), { status: 404 });
  await activityModel.logCustomerActivity(
    Number(result.id),
    "customer_updated",
    "Customer details updated",
    "Contact, vehicle, plan, price or billing details were updated.",
  );
  response.json(result);
}
export async function archiveCustomer(request: Request, response: Response) {
  const id = idSchema.parse(request.params.id);
  if (!(await customerModel.archiveCustomer(id)))
    throw Object.assign(new Error("Customer not found"), { status: 404 });
  await activityModel.logCustomerActivity(id, "customer_archived", "Customer archived");
  response.status(204).send();
}
export async function restoreCustomer(request: Request, response: Response) {
  const result = await customerModel.restoreCustomer(idSchema.parse(request.params.id));
  if (!result) throw Object.assign(new Error("Archived customer not found"), { status: 404 });
  await activityModel.logCustomerActivity(
    Number(result.id),
    "customer_restored",
    "Customer restored",
  );
  response.json({ id: result.id, restored: true });
}
export async function listCustomerActivities(request: Request, response: Response) {
  response.json(await activityModel.findCustomerActivities(idSchema.parse(request.params.id)));
}
