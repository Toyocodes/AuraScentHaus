import type {
  AdminCreateOrderInput,
  AdminUpdateOrderInput,
  OrderChannel,
  OrderDTO,
  OrderStatus,
  Paginated,
  SellableVariantDTO,
} from "@aurascenthaus/shared";
import type { DataResponse, PaginationParams } from "../../helper/types";

export type { AdminCreateOrderInput, AdminUpdateOrderInput, OrderChannel, OrderDTO, OrderStatus, SellableVariantDTO };

/** GET /admin/orders query string */
export interface AdminOrderListParams extends PaginationParams {
  status?: OrderStatus;
  /** Order number, customer email, name or phone. */
  search?: string;
}

export interface UpdateOrderStatusVariables {
  orderId: string;
  status: OrderStatus;
}

export interface UpdateOrderVariables {
  orderId: string;
  input: AdminUpdateOrderInput;
}

export type AdminOrderListResponse = Paginated<OrderDTO>;
export type AdminOrderResponse = DataResponse<OrderDTO>;
export type SellableVariantsResponse = DataResponse<SellableVariantDTO[]>;
