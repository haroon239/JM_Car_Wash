import * as paymentModel from "../models/payment.model.js";
import { paymentSchema } from "../validators/payment.schema.js";
export async function listPayments(_request, response) { response.json(await paymentModel.findPayments()); }
export async function createPayment(request, response) { response.status(201).json(await paymentModel.createPayment(paymentSchema.parse(request.body))); }
