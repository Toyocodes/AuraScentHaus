import { Router } from "express";
import { requirePermission } from "../../middlewares/authorize.js";
import { imageUpload } from "../uploads/uploads.middleware.js";
import * as c from "./categories.controller.js";

/** Public, mounted at /api/categories */
export const categoryRouter = Router();
categoryRouter.get("/", c.list);
categoryRouter.get("/:slug", c.getBySlug);

/** Mounted at /api/admin/categories (ADMIN+) */
export const adminCategoryRouter = Router();
adminCategoryRouter.get("/", requirePermission("products:read"), c.adminList);
adminCategoryRouter.post("/", requirePermission("categories:write"), c.create);
adminCategoryRouter.patch("/:id", requirePermission("categories:write"), c.update);
adminCategoryRouter.post("/:id/image", requirePermission("categories:write"), imageUpload.single("image"), c.uploadImage);
adminCategoryRouter.delete("/:id", requirePermission("categories:delete"), c.remove);
