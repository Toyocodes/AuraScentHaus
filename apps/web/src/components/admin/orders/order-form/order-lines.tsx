"use client";

import { Trash2 } from "lucide-react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import type { SellableVariantDTO } from "@aurascenthaus/shared";
import { FormInput, FormSelect } from "@/components/form";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/format";
import type { OrderFormValues } from "./order-form-schema";

interface OrderLinesProps {
  variants: SellableVariantDTO[];
  /** Stock each size can still sell (for edits, includes this order's own items). */
  stock: ReadonlyMap<string, number>;
}

/** The perfumes being sold: pick a size, set the quantity. */
export function OrderLines({ variants, stock }: OrderLinesProps) {
  const { control } = useFormContext<OrderFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "lines" });
  const lines = useWatch({ control, name: "lines" });

  const options = variants.map((v) => {
    const left = stock.get(v.variantId) ?? v.stock;
    return {
      value: v.variantId,
      label: `${v.productName} · ${v.sizeMl} ml · ${formatNaira(v.price)} · ${left > 0 ? `${left} left` : "out of stock"}${v.isActive ? "" : " (hidden online)"}`,
    };
  });

  return (
    <section className="space-y-4">
      <h2 className="text-2xl">Items</h2>
      <ul className="space-y-3">
        {fields.map((field, i) => {
          const line = lines?.[i];
          const variant = variants.find((v) => v.variantId === line?.variantId);
          const quantity = Number(line?.quantity) || 0;
          return (
            <li key={field.id} className="grid grid-cols-[1fr_5.5rem_auto] items-start gap-2 sm:grid-cols-[1fr_5.5rem_7rem_auto]">
              <FormSelect<OrderFormValues>
                name={`lines.${i}.variantId`}
                options={options}
                placeholder="Choose a perfume and size"
                label={i === 0 ? "Perfume" : undefined}
              />
              <FormInput<OrderFormValues>
                name={`lines.${i}.quantity`}
                label={i === 0 ? "Qty" : undefined}
                type="number"
                min={1}
                inputMode="numeric"
              />
              <p className={`hidden h-9 items-center justify-end text-sm tabular-nums sm:flex ${i === 0 ? "mt-[1.375rem]" : ""}`}>
                {variant ? formatNaira(variant.price * quantity) : "–"}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Remove item"
                className={i === 0 ? "mt-[1.375rem]" : undefined}
                disabled={fields.length === 1}
                onClick={() => remove(i)}
              >
                <Trash2 />
              </Button>
            </li>
          );
        })}
      </ul>
      <FieldArrayError />
      <Button type="button" variant="outline" size="sm" onClick={() => append({ variantId: "", quantity: "1" })}>
        + Add another perfume
      </Button>
    </section>
  );
}

/** Errors for the whole list, e.g. "Add at least one item". */
function FieldArrayError() {
  const {
    formState: { errors },
  } = useFormContext<OrderFormValues>();
  const message = errors.lines?.root?.message ?? errors.lines?.message;
  if (!message) return null;
  return (
    <p className="text-sm text-destructive" role="alert">
      {message}
    </p>
  );
}
