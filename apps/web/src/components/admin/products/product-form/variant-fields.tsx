"use client";

import { useEffect } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import type { SizeUnit } from "@aurascenthaus/shared";
import { FormInput, FormSelect } from "@/components/form";
import { Button } from "@/components/ui/button";
import { emptyVariant, SIZE_UNIT_OPTIONS, type ProductFormValues } from "../product-schema";

/** Size rows for a new product (react-hook-form field array). New rows start in the category's unit. */
export function VariantFields({ defaultUnit = "ML" }: { defaultUnit?: SizeUnit }) {
  const { control, getValues, setValue } = useFormContext<ProductFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "variants" });

  // Choosing a category sets the unit on rows the admin hasn't started filling in.
  useEffect(() => {
    getValues("variants").forEach((row, i) => {
      if (!row.sku && !row.price) setValue(`variants.${i}.sizeUnit`, defaultUnit);
    });
  }, [defaultUnit, getValues, setValue]);

  return (
    <fieldset className="space-y-3">
      <legend className="font-medium">Sizes</legend>
      {fields.map((field, i) => (
        <div key={field.id} className="grid grid-cols-[4.5rem_5.5rem_1fr_7rem_4.5rem_auto] items-start gap-2">
          <FormInput<ProductFormValues> name={`variants.${i}.sizeMl`} label={i === 0 ? "Size" : undefined} type="number" min={1} />
          <FormSelect<ProductFormValues> name={`variants.${i}.sizeUnit`} label={i === 0 ? "Unit" : undefined} options={SIZE_UNIT_OPTIONS} />
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
      <Button type="button" variant="outline" size="sm" onClick={() => append(emptyVariant(defaultUnit))}>
        + Add size
      </Button>
    </fieldset>
  );
}
