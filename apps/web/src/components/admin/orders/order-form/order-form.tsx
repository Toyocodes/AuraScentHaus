"use client";

import { useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type {
  AdminCreateOrderInput,
  AdminUpdateOrderInput,
  OrderDTO,
  SellableVariantDTO,
} from "@aurascenthaus/shared";
import { FormTextarea, SubmitButton, quietly } from "@/components/form";
import { Form } from "@/components/ui/form";
import { AttendantField } from "./attendant-field";
import { CustomerSection } from "./customer-section";
import { FulfilmentSection } from "./fulfilment-section";
import { OrderFormSummary } from "./order-form-summary";
import { OrderLines } from "./order-lines";
import {
  canChangeDelivery,
  EMPTY_ORDER_FORM,
  makeOrderFormSchema,
  toCreateOrderInput,
  toOrderFormValues,
  toUpdateOrderInput,
  type OrderFormValues,
} from "./order-form-schema";
import { PaymentSection } from "./payment-section";

interface OrderFormProps {
  /** Every size with price and stock (`useSellableVariants()`). */
  variants: SellableVariantDTO[];
  /** First name of the signed-in admin (`useMe()`). Display only: the API records the real one. */
  attendantName: string;
  /** Pass an in-store order to edit it. Leave out to record a new sale. */
  order?: OrderDTO;
  isPending?: boolean;
  /** New sale: wire to `useCreateOrder().mutateAsync`. */
  onCreate?: (input: AdminCreateOrderInput) => void | Promise<void>;
  /** Edit: wire to `useUpdateOrder().mutateAsync({ orderId, input })`. */
  onUpdate?: (input: AdminUpdateOrderInput) => void | Promise<void>;
}

/** Record (or edit) a sale made in the shop. */
export function OrderForm({ variants, attendantName, order, isPending, onCreate, onUpdate }: OrderFormProps) {
  const editing = Boolean(order);

  // What can be sold: current stock, plus (when editing) what this order already holds,
  // because the API returns those items to stock before taking the new quantities.
  const stock = useMemo(() => {
    const map = new Map(variants.map((v) => [v.variantId, v.stock]));
    for (const item of order?.items ?? []) {
      if (item.variantId) map.set(item.variantId, (map.get(item.variantId) ?? 0) + item.quantity);
    }
    return map;
  }, [variants, order]);

  const schema = useMemo(() => makeOrderFormSchema(stock), [stock]);
  const form = useForm<OrderFormValues, unknown, Parameters<typeof toCreateOrderInput>[0]>({
    resolver: zodResolver(schema),
    defaultValues: order ? toOrderFormValues(order) : EMPTY_ORDER_FORM,
  });

  const deliveryLocked = order ? !canChangeDelivery(order) : false;

  return (
    <Form {...form}>
      <form
        noValidate
        className="grid gap-10 lg:grid-cols-[1fr_22rem]"
        onSubmit={form.handleSubmit((values) =>
          quietly(async () => {
            if (order) await onUpdate?.(toUpdateOrderInput(values, order));
            else await onCreate?.(toCreateOrderInput(values));
          })(undefined),
        )}
      >
        <div className="space-y-10">
          <OrderLines variants={variants} stock={stock} />
          <CustomerSection initialCustomer={order?.customer} />
          <PaymentSection alreadyPaid={Boolean(order?.paidAt)} />
          <FulfilmentSection disabled={deliveryLocked} />
          <FormTextarea<OrderFormValues>
            name="note"
            label="Note (optional)"
            placeholder="Gift wrap, engraving, anything the team should know…"
            maxLength={500}
          />
        </div>

        <OrderFormSummary variants={variants}>
          <AttendantField name={order?.attendant?.name ?? attendantName} editing={editing} />
          <SubmitButton size="lg" className="w-full" isPending={isPending}>
            {editing ? "Save changes" : "Record sale"}
          </SubmitButton>
        </OrderFormSummary>
      </form>
    </Form>
  );
}
