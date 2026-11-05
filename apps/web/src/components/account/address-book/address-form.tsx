"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { AddressInput } from "@aurascenthaus/shared";
import { AddressFields, addressFormSchema, EMPTY_ADDRESS, toAddressInput } from "@/components/address";
import { FormCheckbox, SubmitButton } from "@/components/form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

const schema = addressFormSchema.extend({ isDefault: z.boolean() });
type AddressBookFormValues = z.input<typeof schema>;

interface AddressFormProps {
  isPending?: boolean;
  /** Wire to `useCreateAddress().mutateAsync`. */
  onSubmit?: (input: AddressInput) => void | Promise<void>;
  onCancel?: () => void;
}

export function AddressForm({ isPending, onSubmit, onCancel }: AddressFormProps) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { ...EMPTY_ADDRESS, isDefault: false },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async ({ isDefault, ...address }) =>
          onSubmit?.(toAddressInput(address, { isDefault })),
        )}
        className="max-w-lg space-y-4 rounded-sm border bg-card p-6"
        noValidate
      >
        <AddressFields />
        <FormCheckbox<AddressBookFormValues> name="isDefault" label="Use as my default address" />
        <div className="flex gap-2">
          <SubmitButton isPending={isPending}>Save address</SubmitButton>
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
