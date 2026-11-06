"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { SizeUnit, VariantInput } from "@aurascenthaus/shared";
import { FormInput, FormSelect, SubmitButton, quietly } from "@/components/form";
import { Form } from "@/components/ui/form";
import { emptyVariant, SIZE_UNIT_OPTIONS, toVariantInput, variantFormSchema, type VariantFormValues } from "../product-schema";

interface AddVariantFormProps {
  /** The unit a new size starts in. */
  defaultUnit?: SizeUnit;
  isPending?: boolean;
  /** Wire to `useAddVariant().mutateAsync({ productId, input })`. */
  onSubmit?: (input: VariantInput) => void | Promise<void>;
}

export function AddVariantForm({ defaultUnit, isPending, onSubmit }: AddVariantFormProps) {
  const form = useForm({ resolver: zodResolver(variantFormSchema), defaultValues: emptyVariant(defaultUnit) });

  return (
    <Form {...form}>
      <form
        className="flex flex-wrap items-start gap-2"
        noValidate
        onSubmit={form.handleSubmit((values) =>
          quietly(async () => {
            await onSubmit?.(toVariantInput(values));
            form.reset(emptyVariant(values.sizeUnit));
          })(undefined),
        )}
      >
        <FormInput<VariantFormValues> name="sizeMl" placeholder="Size" type="number" className="w-20" aria-label="Size" />
        <FormSelect<VariantFormValues> name="sizeUnit" options={SIZE_UNIT_OPTIONS} triggerClassName="w-24" />
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
