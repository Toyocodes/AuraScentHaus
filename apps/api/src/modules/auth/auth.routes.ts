import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { requestCodeLimiter, verifyCodeLimiter } from "../../middlewares/rate-limit.js";
import * as c from "./auth.controller.js";

export const authRouter = Router();

authRouter.post("/request-code", requestCodeLimiter, c.requestCode);
authRouter.post("/verify-code", verifyCodeLimiter, c.verifyCode);
authRouter.get("/me", authenticate, c.me);
authRouter.post("/logout", authenticate, c.logout);
authRouter.post("/logout-all", authenticate, c.logoutAll);
