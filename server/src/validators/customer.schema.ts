import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z
    .string()
    .trim()
    .regex(/^971\d{9}$/),
  email: z.email().optional().or(z.literal("")),
  plateNumber: z.string().trim().min(2).max(40),
  planId: z.coerce.number().int().positive(),
  planStartDate: z.iso.date(),
  agreedPrice: z.coerce.number().nonnegative().max(9999999),
  billingType: z.enum(["monthly", "weekly", "one_time", "manual"]),
  autoInvoice: z.boolean(),
  nextInvoiceDate: z.iso.date().nullable(),
});

export const idSchema = z.coerce.number().int().positive();
export type CustomerInput = z.infer<typeof customerSchema>;
