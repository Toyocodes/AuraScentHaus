import type { Request, Response } from "express";
import { z } from "zod";
import {
  ROLES,
  addressSchema,
  adminCreateCustomerSchema,
  adminUpdateCustomerSchema,
  paginationSchema,
  updateAddressSchema,
  updateProfileSchema,
  updateRoleSchema,
} from "@aurascenthaus/shared";
import { parseBody, parseQuery } from "../../middlewares/validate.js";
import { toUserDTO } from "./users.mapper.js";
import * as users from "./users.service.js";

type IdParams = { id: string };

// ─── Me ──────────────────────────────────────────────────────

export async function getMe(req: Request, res: Response) {
  res.json({ user: toUserDTO(req.user!) });
}

export async function updateMe(req: Request, res: Response) {
  const input = parseBody(updateProfileSchema, req);
  res.json({ user: await users.updateProfile(req.user!.id, input) });
}

export async function listAddresses(req: Request, res: Response) {
  res.json({ data: await users.listAddresses(req.user!.id) });
}

export async function createAddress(req: Request, res: Response) {
  const input = parseBody(addressSchema, req);
  res.status(201).json({ data: await users.createAddress(req.user!.id, input) });
}

export async function updateAddress(req: Request<IdParams>, res: Response) {
  const input = parseBody(updateAddressSchema, req);
  res.json({ data: await users.updateAddress(req.user!.id, req.params.id, input) });
}

export async function deleteAddress(req: Request<IdParams>, res: Response) {
  await users.deleteAddress(req.user!.id, req.params.id);
  res.status(204).end();
}

// ─── Admin ───────────────────────────────────────────────────

const userListQuery = paginationSchema.extend({
  search: z.string().trim().max(100).optional(),
  role: z.enum(ROLES).optional(),
});

/** GET /api/admin/customers */
export async function listCustomers(req: Request, res: Response) {
  const query = parseQuery(userListQuery, req);
  res.json(await users.listUsers({ ...query, role: "CUSTOMER" }));
}

/** POST /api/admin/customers */
export async function createCustomer(req: Request, res: Response) {
  res.status(201).json({ data: await users.createCustomer(parseBody(adminCreateCustomerSchema, req)) });
}

/** PATCH /api/admin/customers/:id */
export async function updateCustomer(req: Request<IdParams>, res: Response) {
  res.json({ data: await users.updateCustomer(req.params.id, parseBody(adminUpdateCustomerSchema, req)) });
}

/** GET /api/admin/users (SUPER_ADMIN) */
export async function listUsers(req: Request, res: Response) {
  res.json(await users.listUsers(parseQuery(userListQuery, req)));
}

/** PATCH /api/admin/users/:id/role (SUPER_ADMIN) */
export async function updateRole(req: Request<IdParams>, res: Response) {
  const { role } = parseBody(updateRoleSchema, req);
  res.json({ user: await users.updateUserRole(req.user!.id, req.params.id, role) });
}
