import { Router } from "express";
import { requirePermission } from "../../middlewares/authorize.js";
import * as c from "./users.controller.js";

/** Mounted at /api/users (authenticated). */
export const userRouter = Router();
userRouter.get("/me", c.getMe);
userRouter.patch("/me", c.updateMe);
userRouter.get("/me/addresses", c.listAddresses);
userRouter.post("/me/addresses", c.createAddress);
userRouter.patch("/me/addresses/:id", c.updateAddress);
userRouter.delete("/me/addresses/:id", c.deleteAddress);

/** Mounted at /api/admin/customers ("customers:read" is checked in admin.routes.ts). */
export const adminCustomerRouter = Router();
adminCustomerRouter.get("/", c.listCustomers);
adminCustomerRouter.post("/", requirePermission("customers:write"), c.createCustomer);
adminCustomerRouter.patch("/:id", requirePermission("customers:write"), c.updateCustomer);

/** Mounted at /api/admin/users ("users:*" permissions = SUPER_ADMIN only). */
export const adminUserRouter = Router();
adminUserRouter.get("/", requirePermission("users:read"), c.listUsers);
adminUserRouter.patch("/:id/role", requirePermission("users:manage-roles"), c.updateRole);
