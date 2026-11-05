import type { RequestHandler } from "express";
import { hasAllPermissions, type Permission } from "@aurascenthaus/shared";
import type { Role } from "../generated/prisma/client.js";
import { ApiError } from "../utils/api-error.js";

/**
 * RBAC by role. Use after `authenticate`.
 *
 *   router.use(authenticate, authorize("ADMIN", "SUPER_ADMIN"))
 */
export function authorize(...roles: Role[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) return next(ApiError.forbidden());
    next();
  };
}

/**
 * RBAC by permission (preferred). Roles map to permissions in
 * packages/shared/src/constants/permissions.ts. Use after `authenticate`.
 *
 *   router.delete("/:id", requirePermission("products:delete"), c.remove)
 */
export function requirePermission(...permissions: Permission[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!hasAllPermissions(req.user.role, permissions)) return next(ApiError.forbidden());
    next();
  };
}
