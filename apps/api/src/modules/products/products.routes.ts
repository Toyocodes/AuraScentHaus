import { Router } from "express";
import { requirePermission } from "../../middlewares/authorize.js";
import { imageUpload } from "../uploads/uploads.middleware.js";
import * as uploads from "../uploads/uploads.controller.js";
import * as c from "./products.controller.js";

/** Public, mounted at /api/products */
export const productRouter = Router();
productRouter.get("/", c.list);
productRouter.get("/:slug", c.getBySlug);

/** Mounted at /api/admin/products (ADMIN+) */
export const adminProductRouter = Router();
adminProductRouter.get("/", requirePermission("products:read"), c.adminList);
adminProductRouter.post("/", requirePermission("products:write"), c.create);
// Must come before /:id. Used by the in-store order form.
adminProductRouter.get("/sellable", requirePermission("orders:create"), c.sellable);
adminProductRouter.get("/:id", requirePermission("products:read"), c.adminGet);
adminProductRouter.patch("/:id", requirePermission("products:write"), c.update);
adminProductRouter.delete("/:id", requirePermission("products:delete"), c.remove);

adminProductRouter.post("/:id/variants", requirePermission("products:write"), c.addVariant);
adminProductRouter.patch("/:id/variants/:variantId", requirePermission("products:write"), c.updateVariant);
adminProductRouter.delete("/:id/variants/:variantId", requirePermission("products:write"), c.deleteVariant);

// multipart/form-data, field name "images" (up to 8 files)
adminProductRouter.post("/:id/images", requirePermission("products:write"), imageUpload.array("images", 8), uploads.uploadProductImages);
adminProductRouter.delete("/:id/images/:imageId", requirePermission("products:write"), uploads.deleteProductImage);
