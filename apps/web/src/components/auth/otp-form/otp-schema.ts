import { z } from "zod";
import { verifyCodeSchema } from "@aurascenthaus/shared";

/** Only the code is typed in. The email comes from step 1. */
export const otpSchema = z.object({ code: verifyCodeSchema.shape.code });
export type OtpValues = z.infer<typeof otpSchema>;
