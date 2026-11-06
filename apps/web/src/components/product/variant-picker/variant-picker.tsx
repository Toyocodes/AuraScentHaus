"use client";

import { LOW_STOCK_THRESHOLD, type VariantDTO } from "@aurascenthaus/shared";
import { cn } from "@/lib/utils";

interface VariantPickerProps {
  variants: VariantDTO[];
  value: string | undefined;
  onChange: (variantId: string) => void;
}

/** Size buttons (30ml, 50ml, 100ml…) with a low-stock hint. */
export function VariantPicker({ variants, value, onChange }: VariantPickerProps) {
  const selected = variants.find((v) => v.id === value);

  return (
    <div className="space-y-3">
      <p className="eyebrow">Size</p>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Size">
        {variants.map((v) => (
          <button
            key={v.id}
            type="button"
            role="radio"
            aria-checked={v.id === value}
            onClick={() => onChange(v.id)}
            className={cn(
              "min-w-20 rounded-sm border px-5 py-3 text-sm tracking-wide transition-colors",
              v.id === value ? "border-foreground bg-foreground text-background" : "hover:border-foreground",
              v.stock <= 0 && "text-muted-foreground line-through decoration-1",
            )}
          >
            {v.sizeLabel}
          </button>
        ))}
      </div>
      {selected && selected.stock > 0 && selected.stock <= LOW_STOCK_THRESHOLD && (
        <p className="text-sm text-gold">Only {selected.stock} left in this size</p>
      )}
    </div>
  );
}
