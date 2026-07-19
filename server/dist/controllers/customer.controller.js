import * as customerModel from "../models/customer.model.js";
import { customerSchema, idSchema } from "../validators/customer.schema.js";
export async function listCustomers(request, response) {
    const view = request.query.view === "archived" ? "archived" : request.query.view === "all" ? "all" : "active";
    response.json(await customerModel.findCustomers(view));
}
export async function createCustomer(request, response) { response.status(201).json(await customerModel.createCustomer(customerSchema.parse(request.body))); }
export async function updateCustomer(request, response) {
    const result = await customerModel.updateCustomer(idSchema.parse(request.params.id), customerSchema.parse(request.body));
    if (!result)
        throw Object.assign(new Error("Customer not found"), { status: 404 });
    response.json(result);
}
export async function archiveCustomer(request, response) {
    if (!await customerModel.archiveCustomer(idSchema.parse(request.params.id)))
        throw Object.assign(new Error("Customer not found"), { status: 404 });
    response.status(204).send();
}
export async function restoreCustomer(request, response) {
    const result = await customerModel.restoreCustomer(idSchema.parse(request.params.id));
    if (!result)
        throw Object.assign(new Error("Archived customer not found"), { status: 404 });
    response.json({ id: result.id, restored: true });
}
