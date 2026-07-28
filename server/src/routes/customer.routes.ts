import { Router } from "express";
import * as controller from "../controllers/customer.controller.js";
export const customerRouter = Router();
customerRouter.get("/", controller.listCustomers).post("/", controller.createCustomer);
customerRouter.get("/:id/activity", controller.listCustomerActivities);
customerRouter.put("/:id", controller.updateCustomer).delete("/:id", controller.archiveCustomer);
customerRouter.patch("/:id/restore", controller.restoreCustomer);
