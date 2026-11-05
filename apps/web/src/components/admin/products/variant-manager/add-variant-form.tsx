"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { VariantInput } from "@aurascenthaus/shared";
import { FormInput, SubmitButton } from "@/components/form";
import { Form } from "@/components/ui/form";
import { toVariantInput, variantFormSchema, type VariantFormValues } from "../product-schema";

const EMPTY: VariantFormValues = { sizeMl: "", sku: "", price: "", stock: "0" };

interface AddVariantFormProps {
  isPending?: boolean;
  /** Wire to `useAddVariant().mutateAsync({ productId, input })`. */
  onSubmit?: (input: VariantInput) => void | Promise<void>;
}

export function AddVariantForm({ isPending, onSubmit }: AddVariantFormProps) {
  const form = useForm({ resolver: zodResolver(variantFormSchema), defaultValues: EMPTY });

  return (
    <Form {...form}>
      <form
        className="flex flex-wrap items-start gap-2"
        noValidate
        onSubmit={form.handleSubmit(async (values) => {
          await onSubmit?.(toVariantInput(values));
          form.reset(EMPTY);
        })}
      >
        <FormInput<VariantFormValues> name="sizeMl" placeholder="ml" type="number" className="w-20" aria-label="Size in ml" />
        <FormInput<VariantFormValues> name="sku" placeholder="SKU" className="w-32" aria-label="SKU" />
        <FormInput<VariantFormValues> name="price" placeholder="Price ₦" type="number" className="w-28" aria-label="Price in naira" />
        <FormInput<VariantFormValues> name="stock" placeholder="Stock" type="number" className="w-20" aria-label="Stock" />
        <SubmitButton variant="outline" isPending={isPending} pendingLabel="Adding…">
          + Add size
        </SubmitButton>
      </form>
    </Form>
  );
}
