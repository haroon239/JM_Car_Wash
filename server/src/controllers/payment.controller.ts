import type { Request, Response } from "express";
import * as paymentModel from "../models/payment.model.js";
import { paymentSchema } from "../validators/payment.schema.js";

export async function listPayments(_request: Request, response: Response) { response.json(await paymentModel.findPayments()); }
export async function createPayment(request: Request, response: Response) { response.status(201).json(await paymentModel.createPayment(paymentSchema.parse(request.body))); }
