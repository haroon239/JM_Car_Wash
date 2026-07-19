import { z } from "zod";
export const settingsSchema = z.object({
    companyName: z.string().trim().min(2).max(150),
    trn: z.string().trim().max(30),
    address: z.string().trim().min(3).max(500),
    invoicePrefix: z.string().trim().min(2).max(12).regex(/^[A-Z0-9-]+$/),
    vatRate: z.coerce.number().min(0).max(100)
});
