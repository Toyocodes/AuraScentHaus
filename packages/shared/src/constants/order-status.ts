export const ORDER_STATUSES = [
  "PENDING", // created, awaiting payment
  "PAID", // payment confirmed by Paystack
  "PROCESSING", // being packed
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = ["PENDING", "SUCCESS", "FAILED", "ABANDONED"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

/** Where the sale happened: the website, or at the shop counter (entered by an admin). */
export const ORDER_CHANNELS = ["ONLINE", "IN_STORE"] as const;
export type OrderChannel = (typeof ORDER_CHANNELS)[number];

/** How an order was paid. Online orders are always PAYSTACK. */
export const PAYMENT_METHODS = ["PAYSTACK", "CASH", "CARD", "TRANSFER"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

/** Methods an admin can pick for an in-store order. */
export const IN_STORE_PAYMENT_METHODS = ["CASH", "CARD", "TRANSFER"] as const satisfies readonly PaymentMethod[];
export type InStorePaymentMethod = (typeof IN_STORE_PAYMENT_METHODS)[number];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  PAYSTACK: "Paystack (online)",
  CASH: "Cash",
  CARD: "Card (POS)",
  TRANSFER: "Bank transfer",
};

export const ORDER_CHANNEL_LABELS: Record<OrderChannel, string> = {
  ONLINE: "Online",
  IN_STORE: "In store",
};

/** Which statuses an admin may move an order to from its current status. */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  PENDING: ["CANCELLED"],
  PAID: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};
