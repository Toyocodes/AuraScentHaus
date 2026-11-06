import { Router } from "express";
import { statsQuerySchema } from "@aurascenthaus/shared";
import { parseQuery } from "../../middlewares/validate.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { requirePermission } from "../../middlewares/authorize.js";
import { adminCategoryRouter } from "../categories/categories.routes.js";
import { adminScentFamilyRouter } from "../scent-families/scent-families.routes.js";
import { adminOrderRouter } from "../orders/orders.routes.js";
import { adminProductRouter } from "../products/products.routes.js";
import { adminCustomerRouter, adminUserRouter } from "../users/users.routes.js";
import { getDashboardStats } from "./admin.service.js";

/**
 * Everything under /api/admin needs "admin:access" (ADMIN or SUPER_ADMIN), and each
 * route then checks its own permission. This is the real RBAC boundary.
 */
export const adminRouter = Router();

adminRouter.use(authenticate, requirePermission("admin:access"));

/** GET /api/admin/stats?range=today|yesterday|last_7_days|last_30_days|…|all_time */
adminRouter.get("/stats", requirePermission("dashboard:view"), async (req, res) => {
  const { range } = parseQuery(statsQuerySchema, req);
  res.json({ data: await getDashboardStats(range) });
});
adminRouter.use("/products", adminProductRouter);
adminRouter.use("/categories", adminCategoryRouter);
adminRouter.use("/scent-families", adminScentFamilyRouter);
adminRouter.use("/orders", adminOrderRouter);
adminRouter.use("/customers", requirePermission("customers:read"), adminCustomerRouter);
adminRouter.use("/users", adminUserRouter);
