import { Router } from "express";
import * as controller from "../controllers/invoice.controller.js";
export const invoiceRouter = Router();
invoiceRouter.get("/paged", controller.listInvoicePage);
invoiceRouter.get("/", controller.listInvoices).post("/", controller.createInvoice);
invoiceRouter.patch("/:id/status", controller.updateInvoiceStatus);
invoiceRouter.put("/:id", controller.editInvoice);
invoiceRouter.get("/:id/revisions", controller.listInvoiceRevisions);
