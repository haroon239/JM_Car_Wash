import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";

export const notFoundHandler: RequestHandler = (_request, response) => {
  response.status(404).json({ message: "Route not found" });
};

export const errorHandler: ErrorRequestHandler = (error: Error & { status?: number; code?: string }, _request, response, _next) => {
  console.error(error);
  if (error instanceof ZodError) {
    const field = error.issues[0]?.path[0];
    const messages: Record<string, string> = {
      trn: "Please enter a valid TRN, or leave the TRN field empty.",
      companyName: "Please enter a valid company name.",
      address: "Please enter a valid business address.",
      invoicePrefix: "Invoice prefix may only contain capital letters, numbers and hyphens.",
      vatRate: "Please enter a VAT rate between 0 and 100."
    };
    return response.status(400).json({ message: messages[String(field)] ?? "Please check the entered information and try again." });
  }
  if (error.code === "23505") return response.status(409).json({ message: "A record with these details already exists" });
  response.status(error.status ?? 500).json({ message: error.message || "Unexpected server error" });
};
