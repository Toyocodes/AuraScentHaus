import { z } from "zod";
import { OTP_LENGTH } from "../constants/index.js";

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254)
  .pipe(z.email("Enter a valid email address"));

export const requestCodeSchema = z.object({
  email: emailSchema,
});
export type RequestCodeInput = z.infer<typeof requestCodeSchema>;

const otpPattern = new RegExp("^\\d{" + OTP_LENGTH + "}$");

export const verifyCodeSchema = z.object({
  email: emailSchema,
  code: z.string().trim().regex(otpPattern, "Enter the " + OTP_LENGTH + "-digit code"),
});
export type VerifyCodeInput = z.infer<typeof verifyCodeSchema>;
