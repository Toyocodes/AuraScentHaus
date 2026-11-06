"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { FormTagsInput } from "@/components/form";
import type { ProductFormValues } from "../product-schema";

const FIELDS = [
  { name: "topNotes", label: "Top notes", placeholder: "Bergamot, Pink Pepper…", hint: "The first impression." },
  { name: "heartNotes", label: "Heart notes", placeholder: "Rose, Jasmine…", hint: "The character of the fragrance." },
  { name: "baseNotes", label: "Base notes", placeholder: "Sandalwood, Musk…", hint: "What lingers." },
] as const;

interface FragrancePyramidFieldsProps {
  /** The chosen category has the fragrance pyramid. */
  allowNotes: boolean;
  categoryName?: string;
}

/**
 * Top, heart and base notes, only for categories with the pyramid. If a product with notes
 * moves to another category they stay stored but hidden, and this says so.
 */
export function FragrancePyramidFields({ allowNotes, categoryName }: FragrancePyramidFieldsProps) {
  const { control } = useFormContext<ProductFormValues>();
  const [top, heart, base] = useWatch({ control, name: ["topNotes", "heartNotes", "baseNotes"] });
  const storedCount = (top?.length ?? 0) + (heart?.length ?? 0) + (base?.length ?? 0);

  if (!allowNotes) {
    if (storedCount === 0 || !categoryName) return null;
    return (
      <p role="status" className="rounded-sm border bg-sand/40 p-4 text-sm text-muted-foreground">
        {categoryName} doesn&apos;t use fragrance notes, so this product&apos;s {storedCount}{" "}
        {storedCount === 1 ? "note" : "notes"} will be hidden from shoppers. They aren&apos;t deleted: moving the product back
        to a category with notes restores them.
      </p>
    );
  }

  return (
    <fieldset className="space-y-4 rounded-sm border p-5">
      <legend className="px-1 font-heading text-xl">Fragrance pyramid</legend>
      <p className="text-sm text-muted-foreground">Optional. Press Enter or type a comma after each note.</p>
      {FIELDS.map((f) => (
        <FormTagsInput<ProductFormValues>
          key={f.name}
          name={f.name}
          label={f.label}
          placeholder={f.placeholder}
          description={f.hint}
        />
      ))}
    </fieldset>
  );
}
