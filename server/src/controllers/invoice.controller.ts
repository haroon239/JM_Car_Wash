import type { Request, Response } from "express";
import * as invoiceModel from "../models/invoice.model.js";
import { idSchema } from "../validators/customer.schema.js";
import { invoiceStatusSchema } from "../validators/payment.schema.js";

export async function listInvoices(_request: Request, response: Response) {
  response.json(await invoiceModel.findInvoices());
}
export async function createInvoice(request: Request, response: Response) {
  const customerId = idSchema.parse(request.body.customerId);
  const invoice = await invoiceModel.createInvoice(customerId);
  response.status(invoice.wasExisting ? 200 : 201).json(invoice);
}
export async function updateInvoiceStatus(request: Request, response: Response) {
  const result = await invoiceModel.updateInvoiceStatus(
    idSchema.parse(request.params.id),
    invoiceStatusSchema.parse(request.body).status,
  );
  if (!result) throw Object.assign(new Error("Invoice not found"), { status: 404 });
  response.json(result);
}
