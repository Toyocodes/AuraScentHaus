import type { Permission, RequestCodeInput, Role, UserDTO, VerifyCodeInput } from "@aurascenthaus/shared";
import type { UserResponse } from "../helper/types";

export type { RequestCodeInput, VerifyCodeInput, UserDTO, Role, Permission };

/** POST /auth/request-code */
export interface RequestCodeResponse {
  message: string;
  /** ISO time the code expires. */
  expiresAt: string;
  /** Seconds until another code can be requested. */
  resendAfterSeconds: number;
}

/** POST /auth/verify-code */
export interface VerifyCodeResponse extends UserResponse<UserDTO> {
  isNewUser: boolean;
}

/** GET /auth/me */
export type MeResponse = UserResponse<UserDTO>;
