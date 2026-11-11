"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { AdminUpdateOrderInput, OrderDTO } from "@aurascenthaus/shared";
import {
  AddressFields,
  addressFormSchema,
  EMPTY_ADDRESS,
  rawAddressSchema,
  toAddressFormValues,
  toAddressInput,
} from "@/components/address";
import { FormTextarea, SubmitButton, quietly } from "@/components/form";
import { Form } from "@/components/ui/form";
import { canChangeDelivery } from "../order-form/order-form-schema";

const fields = z.object({ delivery: rawAddressSchema, note: z.string().trim().max(500) });
type Values = z.input<typeof fields>;

/** The address is only checked while it can be changed (not for pickup or shipped orders). */
const makeSchema = (checkAddress: boolean) =>
  fields.superRefine((v, ctx) => {
    if (!checkAddress) return;
    const result = addressFormSchema.safeParse(v.delivery);
    if (result.success) return;
    for (const issue of result.error.issues) {
      ctx.addIssue({ code: "custom", message: issue.message, path: ["delivery", ...issue.path] });
    }
  });

interface OnlineOrderEditFormProps {
  order: OrderDTO;
  isPending?: boolean;
  /** Wire to `useUpdateOrder().mutateAsync({ orderId, input })`. */
  onSubmit?: (input: AdminUpdateOrderInput) => void | Promise<void>;
}

/**
 * Online orders were paid on Paystack, so only the delivery address and note can change
 * (the API enforces this too). Items and payment are locked.
 */
export function OnlineOrderEditForm({ order, isPending, onSubmit }: OnlineOrderEditFormProps) {
  const a = order.shippingAddress;
  const pickup = order.delivery?.method === "PICKUP";
  const addressEditable = !pickup && canChangeDelivery(order);
  const form = useForm<Values>({
    resolver: zodResolver(makeSchema(addressEditable)),
    defaultValues: {
      delivery: a ? toAddressFormValues(a) : EMPTY_ADDRESS,
      note: order.note ?? "",
    },
  });

  return (
    <Form {...form}>
      <form
        noValidate
        className="max-w-2xl space-y-10"
        onSubmit={form.handleSubmit((v) =>
          quietly(() =>
            onSubmit?.({
              note: v.note || null,
              ...(addressEditable && { delivery: toAddressInput(v.delivery) }),
            }),
          )(undefined),
        )}
      >
        <p className="rounded-sm border bg-sand/40 p-4 text-sm text-muted-foreground">
          Paid online with Paystack: items, prices and payment can&apos;t be changed. To undo the sale, cancel the
          order and refund it from your Paystack dashboard.
        </p>
        <section className="space-y-4">
          <h2 className="text-2xl">Delivery address</h2>
          {pickup ? (
            <p className="text-sm text-muted-foreground">
              Store pickup ({order.delivery?.option}): the customer collects this order, so there&apos;s no address.
            </p>
          ) : addressEditable ? (
            <AddressFields prefix="delivery" />
          ) : (
            <p className="text-sm text-muted-foreground">This order has shipped, so the address can no longer change.</p>
          )}
        </section>
        <FormTextarea<Values> name="note" label="Note" maxLength={500} />
        <SubmitButton size="lg" isPending={isPending}>
          Save changes
        </SubmitButton>
      </form>
    </Form>
  );
}
