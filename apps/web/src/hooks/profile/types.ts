import type { UpdateProfileInput, UserDTO } from "@aurascenthaus/shared";
import type { UserResponse } from "../helper/types";

export type { UserDTO, UpdateProfileInput };

/** GET / PATCH /users/me */
export type ProfileResponse = UserResponse<UserDTO>;
