import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  console.error("─".repeat(60));
  console.error(`[ERROR] ${err.name}: ${err.message}`);
  if (err.stack) console.error(err.stack);
  console.error("─".repeat(60));

  if (err instanceof ZodError) {
    return res.status(422).json({
      error: "Validation error",
      details: err.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  if (err.message.includes("Unique constraint")) {
    return res.status(409).json({ error: "Resource already exists" });
  }

  const isDev = process.env.NODE_ENV !== "production";
  return res.status(500).json({
    error: isDev ? err.message : "Internal server error",
    ...(isDev && { stack: err.stack?.split("\n").slice(0, 5) }),
  });
}
