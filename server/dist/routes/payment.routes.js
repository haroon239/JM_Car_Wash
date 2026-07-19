import { Router } from "express";
import * as controller from "../controllers/payment.controller.js";
export const paymentRouter = Router();
paymentRouter.get("/", controller.listPayments).post("/", controller.createPayment);
