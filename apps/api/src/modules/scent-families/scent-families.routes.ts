import { Router } from "express";
import { requirePermission } from "../../middlewares/authorize.js";
import * as c from "./scent-families.controller.js";

/** Public, mounted at /api/scent-families */
export const scentFamilyRouter = Router();
scentFamilyRouter.get("/", c.list);

/** Mounted at /api/admin/scent-families (ADMIN+). Same permissions as categories. */
export const adminScentFamilyRouter = Router();
adminScentFamilyRouter.get("/", requirePermission("products:read"), c.adminList);
adminScentFamilyRouter.post("/", requirePermission("categories:write"), c.create);
adminScentFamilyRouter.patch("/:id", requirePermission("categories:write"), c.update);
adminScentFamilyRouter.delete("/:id", requirePermission("categories:delete"), c.remove);
