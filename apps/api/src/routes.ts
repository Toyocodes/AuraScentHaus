import { Router } from "express";
import { authenticate } from "./middlewares/authenticate.js";
import { adminRouter } from "./modules/admin/admin.routes.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { cartRouter } from "./modules/cart/cart.routes.js";
import { deliveryZoneRouter } from "./modules/delivery/delivery.routes.js";
import { categoryRouter } from "./modules/categories/categories.routes.js";
import { scentFamilyRouter } from "./modules/scent-families/scent-families.routes.js";
import { orderRouter } from "./modules/orders/orders.routes.js";
import { paymentRouter } from "./modules/payments/payment.routes.js";
import { productRouter } from "./modules/products/products.routes.js";
import { userRouter } from "./modules/users/users.routes.js";

/** All routes are mounted under /api (see app.ts). */
export const routes = Router();

routes.get("/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Public
routes.use("/auth", authRouter);
routes.use("/products", productRouter);
routes.use("/categories", categoryRouter);
routes.use("/scent-families", scentFamilyRouter);
routes.use("/delivery-zones", deliveryZoneRouter);
routes.use("/payments", paymentRouter); // its routes authenticate individually

// Signed-in customers
routes.use("/users", authenticate, userRouter);
routes.use("/cart", authenticate, cartRouter);
routes.use("/orders", authenticate, orderRouter);

// Admin (RBAC inside)
routes.use("/admin", adminRouter);
