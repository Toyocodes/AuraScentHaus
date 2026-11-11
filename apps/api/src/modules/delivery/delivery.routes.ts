import { Router } from "express";
import { requirePermission } from "../../middlewares/authorize.js";
import * as c from "./delivery.controller.js";

/** Public, mounted at /api/delivery-zones */
export const deliveryZoneRouter = Router();
deliveryZoneRouter.get("/", c.list);

/** Mounted at /api/admin/delivery-zones. Admins and super admins ("delivery:write"). */
export const adminDeliveryZoneRouter = Router();
adminDeliveryZoneRouter.get("/", c.adminList);
adminDeliveryZoneRouter.post("/", requirePermission("delivery:write"), c.create);
adminDeliveryZoneRouter.patch("/:id", requirePermission("delivery:write"), c.update);
adminDeliveryZoneRouter.delete("/:id", requirePermission("delivery:write"), c.remove);
