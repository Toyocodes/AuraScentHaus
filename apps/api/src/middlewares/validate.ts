import type { Request } from "express";
import type { z } from "zod";

/**
 * Parse + validate request input with a Zod schema (usually from @aurascenthaus/shared).
 * Throws ZodError, which the error handler returns as 422 with field errors.
 *
 *   const input = parseBody(productSchema, req);
 */
export function parseBody<S extends z.ZodType>(schema: S, req: Request): z.infer<S> {
  return schema.parse(req.body ?? {});
}

export function parseQuery<S extends z.ZodType>(schema: S, req: Request): z.infer<S> {
  return schema.parse(req.query);
}
