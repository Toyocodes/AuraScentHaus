import { Router } from "express";
import * as c from "./cart.controller.js";

/** Mounted at /api/cart (authenticated). */
export const cartRouter = Router();
cartRouter.get("/", c.get);
cartRouter.delete("/", c.clear);
cartRouter.post("/merge", c.merge);
cartRouter.post("/items", c.addItem);
cartRouter.patch("/items/:variantId", c.updateItem);
cartRouter.delete("/items/:variantId", c.removeItem);
