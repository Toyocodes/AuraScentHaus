import { Router } from "express";
import { requirePermission } from "../../middlewares/authorize.js";
import * as c from "./orders.controller.js";

/** Mounted at /api/orders (authenticated). Orders are created via /api/payments/checkout. */
export const orderRouter = Router();
orderRouter.get("/", c.listMine);
orderRouter.get("/:id", c.getMine);

/** Mounted at /api/admin/orders. POST / and PATCH /:id are for in-store sales and edits. */
export const adminOrderRouter = Router();
adminOrderRouter.get("/", requirePermission("orders:read"), c.adminList);
adminOrderRouter.post("/", requirePermission("orders:create"), c.adminCreate);
adminOrderRouter.get("/:id", requirePermission("orders:read"), c.adminGet);
adminOrderRouter.patch("/:id", requirePermission("orders:update"), c.adminUpdate);
adminOrderRouter.patch("/:id/status", requirePermission("orders:update"), c.adminUpdateStatus);
