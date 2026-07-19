import type { ErrorRequestHandler, RequestHandler } from "express";

export const notFoundHandler: RequestHandler = (_request, response) => {
  response.status(404).json({ message: "Route not found" });
};

export const errorHandler: ErrorRequestHandler = (error: Error & { status?: number; code?: string }, _request, response, _next) => {
  console.error(error);
  if (error.code === "23505") return response.status(409).json({ message: "A record with these details already exists" });
  response.status(error.status ?? 500).json({ message: error.message || "Unexpected server error" });
};
