import { z } from "zod";

export const paymentSchema = z.object({
  invoiceId: z.coerce.number().int().positive(),
  method: z.enum(["cash", "card", "bank_transfer", "other"]),
  reference: z.string().trim().max(100).optional().default("")
});

export const invoiceStatusSchema = z.object({ status: z.enum(["pending", "sent", "paid", "overdue"]) });
export type PaymentInput = z.infer<typeof paymentSchema>;
