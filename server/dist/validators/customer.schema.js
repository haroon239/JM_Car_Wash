import { z } from "zod";
export const customerSchema = z.object({
    name: z.string().trim().min(2).max(120),
    phone: z.string().trim().regex(/^971\d{9}$/),
    email: z.email().optional().or(z.literal("")),
    plateNumber: z.string().trim().min(2).max(40),
    planId: z.coerce.number().int().positive(),
    planStartDate: z.iso.date()
});
export const idSchema = z.coerce.number().int().positive();
