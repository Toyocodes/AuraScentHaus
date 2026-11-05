import type { OrderDTO, OrderItemDTO, OrderStatus, Paginated } from "@aurascenthaus/shared";
import type { DataResponse, PaginationParams } from "../helper/types";

export type { OrderDTO, OrderItemDTO, OrderStatus };

/** GET /orders query string */
export type MyOrdersParams = PaginationParams;

export type OrderListResponse = Paginated<OrderDTO>;
export type OrderResponse = DataResponse<OrderDTO>;
