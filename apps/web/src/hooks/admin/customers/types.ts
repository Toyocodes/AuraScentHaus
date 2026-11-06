import type {
  AdminCreateCustomerInput,
  AdminUpdateCustomerInput,
  Paginated,
  UserDTO,
} from "@aurascenthaus/shared";
import type { DataResponse, PaginationParams } from "../../helper/types";

export type { AdminCreateCustomerInput, AdminUpdateCustomerInput };

/** A shopper, with how many paid orders they've placed. */
export interface CustomerDTO extends UserDTO {
  paidOrders: number;
}

/** GET /admin/customers query string */
export interface CustomerListParams extends PaginationParams {
  /** Email, name or phone. */
  search?: string;
}

export interface UpdateCustomerVariables {
  customerId: string;
  input: AdminUpdateCustomerInput;
}

export type CustomerListResponse = Paginated<CustomerDTO>;
export type CustomerResponse = DataResponse<CustomerDTO>;
