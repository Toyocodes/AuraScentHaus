import type { Paginated, Role, UserDTO } from "@aurascenthaus/shared";
import type { PaginationParams, UserResponse } from "../../helper/types";

export type { Role, UserDTO };

/** GET /admin/users query string */
export interface UserListParams extends PaginationParams {
  /** Email or name. */
  search?: string;
  role?: Role;
}

export interface UpdateUserRoleVariables {
  userId: string;
  role: Role;
}

export type UserListResponse = Paginated<UserDTO>;
export type UpdateUserRoleResponse = UserResponse<UserDTO>;
