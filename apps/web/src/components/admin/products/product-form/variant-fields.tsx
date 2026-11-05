"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { FormInput } from "@/components/form";
import { Button } from "@/components/ui/button";
import { EMPTY_VARIANT, type ProductFormValues } from "../product-schema";

/** Size rows for a new product (react-hook-form field array). */
export function VariantFields() {
  const { control } = useFormContext<ProductFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "variants" });

  return (
    <fieldset className="space-y-3">
      <legend className="font-medium">Sizes</legend>
      {fields.map((field, i) => (
        <div key={field.id} className="grid grid-cols-[5rem_1fr_8rem_5rem_auto] items-start gap-2">
          <FormInput<ProductFormValues> name={`variants.${i}.sizeMl`} label={i === 0 ? "ml" : undefined} type="number" min={1} />
          <FormInput<ProductFormValues> name={`variants.${i}.sku`} label={i === 0 ? "SKU" : undefined} />
          <FormInput<ProductFormValues> name={`variants.${i}.price`} label={i === 0 ? "Price (₦)" : undefined} type="number" min={0} />
          <FormInput<ProductFormValues> name={`variants.${i}.stock`} label={i === 0 ? "Stock" : undefined} type="number" min={0} />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={i === 0 ? "mt-6" : undefined}
            disabled={fields.length === 1}
            onClick={() => remove(i)}
          >
            Remove
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => append({ ...EMPTY_VARIANT, sizeMl: "100" })}>
        + Add size
      </Button>
    </fieldset>
  );
}
