import { z } from "zod";
import {
  IN_STORE_PAYMENT_METHODS,
  emailSchema,
  phoneSchema,
  type AdminCreateOrderInput,
  type AdminOrderCustomer,
  type AdminUpdateOrderInput,
  type OrderDTO,
} from "@aurascenthaus/shared";
import { addressFormSchema, EMPTY_ADDRESS, rawAddressSchema, toAddressInput } from "@/components/address";

export const CUSTOMER_TYPES = ["existing", "new", "walk_in"] as const;
export const FULFILMENTS = ["collected", "delivery"] as const;

/** Same rule as the API: once shipped or collected, the delivery choice is final. */
export const canChangeDelivery = (order: Pick<OrderDTO, "status">) =>
  order.status === "PENDING" || order.status === "PAID" || order.status === "PROCESSING";

const lineSchema = z.object({
  variantId: z.string().min(1, "Choose a perfume"),
  quantity: z.coerce.number<string | number>().int("Whole numbers only").min(1, "At least 1").max(100),
});

const orderFormBase = z.object({
  customerType: z.enum(CUSTOMER_TYPES),
  customerId: z.string(),
  newCustomer: z.object({ email: z.string(), name: z.string(), phone: z.string() }),
  walkIn: z.object({ name: z.string(), phone: z.string() }),
  lines: z.array(lineSchema).min(1, "Add at least one item"),
  paymentMethod: z.enum(IN_STORE_PAYMENT_METHODS),
  isPaid: z.boolean(),
  fulfilment: z.enum(FULFILMENTS),
  delivery: rawAddressSchema,
  note: z.string().trim().max(500),
});
export type OrderFormValues = z.input<typeof orderFormBase>;
type ParsedOrderValues = z.output<typeof orderFormBase>;

/**
 * The form's rules. `stock` is how many of each size can be sold
 * (when editing, it already includes what this order holds).
 */
export function makeOrderFormSchema(stock: ReadonlyMap<string, number>) {
  return orderFormBase.superRefine((v, ctx) => {
    const issue = (path: (string | number)[], message: string) => ctx.addIssue({ code: "custom", path, message });
    const invalidPhone = (phone: string) => phone !== "" && !phoneSchema.safeParse(phone).success;

    if (v.customerType === "existing" && !v.customerId) issue(["customerId"], "Choose a customer");
    if (v.customerType === "new") {
      if (!emailSchema.safeParse(v.newCustomer.email).success) issue(["newCustomer", "email"], "Enter a valid email address");
      if (!v.newCustomer.name.trim()) issue(["newCustomer", "name"], "Enter their name");
      if (invalidPhone(v.newCustomer.phone)) issue(["newCustomer", "phone"], "Enter a valid phone number");
    }
    if (v.customerType === "walk_in" && invalidPhone(v.walkIn.phone)) issue(["walkIn", "phone"], "Enter a valid phone number");

    if (v.fulfilment === "delivery") {
      const address = addressFormSchema.safeParse(v.delivery);
      if (!address.success) for (const i of address.error.issues) issue(["delivery", ...(i.path as string[])], i.message);
    }

    // The same size may be on two lines, so compare the total for each size.
    const wanted = new Map<string, number>();
    for (const l of v.lines) wanted.set(l.variantId, (wanted.get(l.variantId) ?? 0) + l.quantity);
    v.lines.forEach((l, i) => {
      const available = stock.get(l.variantId);
      if (available !== undefined && (wanted.get(l.variantId) ?? 0) > available) {
        issue(["lines", i, "quantity"], available === 0 ? "Out of stock" : `Only ${available} in stock`);
      }
    });
  });
}

export const EMPTY_ORDER_FORM: OrderFormValues = {
  customerType: "walk_in",
  customerId: "",
  newCustomer: { email: "", name: "", phone: "" },
  walkIn: { name: "", phone: "" },
  lines: [{ variantId: "", quantity: "1" }],
  paymentMethod: "CASH",
  isPaid: true,
  fulfilment: "collected",
  delivery: EMPTY_ADDRESS,
  note: "",
};

/** Fill the form from an existing in-store order (edit page). */
export function toOrderFormValues(order: OrderDTO): OrderFormValues {
  const a = order.shippingAddress;
  return {
    ...EMPTY_ORDER_FORM,
    customerType: order.customer ? "existing" : "walk_in",
    customerId: order.customer?.id ?? "",
    walkIn: { name: order.contact.name ?? "", phone: order.contact.phone ?? "" },
    lines: order.items
      .filter((i) => i.variantId)
      .map((i) => ({ variantId: i.variantId!, quantity: String(i.quantity) })),
    paymentMethod: order.paymentMethod === "PAYSTACK" ? "CASH" : order.paymentMethod,
    isPaid: order.paidAt !== null,
    fulfilment: a ? "delivery" : "collected",
    delivery: a
      ? { fullName: a.fullName, phone: a.phone, line1: a.line1, line2: a.line2 ?? "", city: a.city, state: a.state }
      : EMPTY_ADDRESS,
    note: order.note ?? "",
  };
}

function toCustomer(v: ParsedOrderValues): AdminOrderCustomer {
  if (v.customerType === "existing") return { type: "existing", customerId: v.customerId };
  if (v.customerType === "new") {
    return { type: "new", email: v.newCustomer.email, name: v.newCustomer.name.trim(), phone: v.newCustomer.phone || undefined };
  }
  return { type: "walk_in", name: v.walkIn.name.trim() || undefined, phone: v.walkIn.phone || undefined };
}

const toItems = (v: ParsedOrderValues) => v.lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity }));

/** Note: there's no attendant here on purpose. The API records the signed-in admin. */
export function toCreateOrderInput(v: ParsedOrderValues): AdminCreateOrderInput {
  return {
    customer: toCustomer(v),
    items: toItems(v),
    paymentMethod: v.paymentMethod,
    isPaid: v.isPaid,
    delivery: v.fulfilment === "delivery" ? toAddressInput(v.delivery) : undefined,
    note: v.note || undefined,
  };
}

export function toUpdateOrderInput(v: ParsedOrderValues, order: OrderDTO): AdminUpdateOrderInput {
  return {
    customer: toCustomer(v),
    items: toItems(v),
    paymentMethod: v.paymentMethod,
    ...(canChangeDelivery(order) && { delivery: v.fulfilment === "delivery" ? toAddressInput(v.delivery) : null }),
    note: v.note || null,
    ...(v.isPaid && !order.paidAt && { markAsPaid: true as const }),
  };
}
