"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { AdminUpdateOrderInput, OrderDTO } from "@aurascenthaus/shared";
import { AddressFields, addressFormSchema, EMPTY_ADDRESS, toAddressInput } from "@/components/address";
import { FormTextarea, SubmitButton, quietly } from "@/components/form";
import { Form } from "@/components/ui/form";
import { canChangeDelivery } from "../order-form/order-form-schema";

const schema = z.object({ delivery: addressFormSchema, note: z.string().trim().max(500) });
type Values = z.input<typeof schema>;

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
  const addressEditable = canChangeDelivery(order);
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      delivery: a
        ? { fullName: a.fullName, phone: a.phone, line1: a.line1, line2: a.line2 ?? "", city: a.city, state: a.state }
        : EMPTY_ADDRESS,
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
          {addressEditable ? (
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
