import { Router } from "express";
import { healthCheck } from "../controllers/health.controller.js";
import { customerRouter } from "./customer.routes.js";
import { planRouter } from "./plan.routes.js";
import { invoiceRouter } from "./invoice.routes.js";
import { paymentRouter } from "./payment.routes.js";
import { settingsRouter } from "./settings.routes.js";

export const apiRouter = Router();
apiRouter.get("/health", healthCheck);
apiRouter.use("/customers", customerRouter);
apiRouter.use("/plans", planRouter);
apiRouter.use("/invoices", invoiceRouter);
apiRouter.use("/payments", paymentRouter);
apiRouter.use("/settings", settingsRouter);
