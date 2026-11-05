import type { CheckoutInput, CheckoutResponse, OrderDTO } from "@aurascenthaus/shared";
import type { DataResponse } from "../helper/types";

export type { CheckoutInput, CheckoutResponse, OrderDTO };

/** POST /payments/checkout */
export type InitializePaymentResponse = DataResponse<CheckoutResponse>;

/** GET /payments/verify/:reference returns the order with its payment status. */
export type VerifyPaymentResponse = DataResponse<OrderDTO>;
