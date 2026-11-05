import type { ErrorRequestHandler, RequestHandler } from "express";
import multer from "multer";
import { z } from "zod";
import { Prisma } from "../generated/prisma/client.js";
import { isProd } from "../config/env.js";
import { ApiError } from "../utils/api-error.js";

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new ApiError(404, `Route ${req.method} ${req.path} not found`, "ROUTE_NOT_FOUND"));
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ApiError) {
    res.status(err.status).json({ error: { message: err.message, code: err.code, details: err.details } });
    return;
  }

  if (err instanceof z.ZodError) {
    // { fieldErrors: { "email": [...], "address.city": [...] }, formErrors: [...] }
    const fieldErrors: Record<string, string[]> = {};
    const formErrors: string[] = [];
    for (const issue of err.issues) {
      const key = issue.path.map(String).join(".");
      if (key) (fieldErrors[key] ??= []).push(issue.message);
      else formErrors.push(issue.message);
    }
    const first = err.issues[0]?.message;
    res.status(422).json({
      error: {
        message: first ? `Validation failed: ${first}` : "Validation failed",
        code: "VALIDATION_ERROR",
        details: { fieldErrors, formErrors },
      },
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      res.status(409).json({
        error: { message: "That value is already in use", code: "DUPLICATE", details: err.meta },
      });
      return;
    }
    if (err.code === "P2025") {
      res.status(404).json({ error: { message: "Record not found", code: "NOT_FOUND" } });
      return;
    }
  }

  if (err instanceof multer.MulterError) {
    res.status(400).json({ error: { message: err.message, code: err.code } });
    return;
  }

  // Malformed JSON body
  if (err?.type === "entity.parse.failed") {
    res.status(400).json({ error: { message: "Invalid JSON body", code: "INVALID_JSON" } });
    return;
  }

  console.error(err);
  res.status(500).json({
    error: { message: isProd ? "Something went wrong" : String(err?.message ?? err), code: "INTERNAL" },
  });
};
