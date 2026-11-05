/** Response envelopes shared by every module. Module-specific types live in each module's types.ts. */
export type { Paginated } from "@aurascenthaus/shared";

/** Most endpoints wrap their payload in `{ data }`. */
export interface DataResponse<T> {
  data: T;
}

/** Auth and profile endpoints return `{ user }`. */
export interface UserResponse<T> {
  user: T;
}

/** Query-string params for list endpoints. */
export interface PaginationParams {
  page?: number;
  limit?: number;
}
