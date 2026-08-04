import type { Request, Response } from "express";
import * as invoiceModel from "../models/invoice.model.js";
import { createNextCustomerInvoice } from "../services/billing.service.js";
import { idSchema } from "../validators/customer.schema.js";
import { invoiceEditSchema, invoiceStatusSchema } from "../validators/payment.schema.js";

export async function listInvoices(_request: Request, response: Response) {
  response.json(await invoiceModel.findInvoices());
}
export async function listInvoicePage(request: Request, response: Response) {
  const positiveInteger = (value: unknown, fallback: number, maximum?: number) => {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 1) return fallback;
    return maximum ? Math.min(parsed, maximum) : parsed;
  };
  const optionalId = (value: unknown) => {
    if (value === undefined || value === "") return undefined;
    return positiveInteger(value, 0) || undefined;
  };
  const allowedStatuses = new Set([
    "pending",
    "sent",
    "paid",
    "overdue",
    "partially_paid",
    "partially_overdue",
  ]);
  const status = String(request.query.status ?? "");
  response.json(
    await invoiceModel.findInvoicePage({
      page: positiveInteger(request.query.page, 1),
      pageSize: positiveInteger(request.query.pageSize, 20, 100),
      search:
        String(request.query.search ?? "")
          .trim()
          .slice(0, 100) || undefined,
      status: allowedStatuses.has(status) ? status : undefined,
      areaId: optionalId(request.query.areaId),
      buildingId: optionalId(request.query.buildingId),
    }),
  );
}
export async function createInvoice(request: Request, response: Response) {
  const customerId = idSchema.parse(request.body.customerId);
  const invoice = await createNextCustomerInvoice(customerId);
  const schedule = await invoiceModel.findCustomerBillingSchedule(customerId);
  response
    .status(invoice.wasExisting ? 200 : 201)
    .json({ ...invoice, nextInvoiceDate: schedule?.invoiceDate ?? null });
}
export async function updateInvoiceStatus(request: Request, response: Response) {
  const result = await invoiceModel.updateInvoiceStatus(
    idSchema.parse(request.params.id),
    invoiceStatusSchema.parse(request.body).status,
  );
  if (!result) throw Object.assign(new Error("Invoice not found"), { status: 404 });
  response.json(result);
}
export async function editInvoice(request: Request, response: Response) {
  response.json(
    await invoiceModel.editInvoice(
      idSchema.parse(request.params.id),
      invoiceEditSchema.parse(request.body),
    ),
  );
}
export async function listInvoiceRevisions(request: Request, response: Response) {
  response.json(await invoiceModel.findInvoiceRevisions(idSchema.parse(request.params.id)));
}
