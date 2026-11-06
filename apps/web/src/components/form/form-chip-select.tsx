"use client";

import type { ReactNode } from "react";
import { useFormContext, type FieldPath, type FieldValues } from "react-hook-form";
import { FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import type { SelectOption } from "./form-select";

export interface FormChipSelectProps<T extends FieldValues> {
  /** A field holding string[]. */
  name: FieldPath<T>;
  options: readonly SelectOption[];
  label?: ReactNode;
  description?: ReactNode;
  itemClassName?: string;
}

/** Pick several options by toggling chips. */
export function FormChipSelect<T extends FieldValues>({ name, options, label, description, itemClassName }: FormChipSelectProps<T>) {
  const { control } = useFormContext<T>();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const selected = (field.value as string[] | undefined) ?? [];
        return (
          <FormItem className={itemClassName}>
            {label && <FormLabel>{label}</FormLabel>}
            <div className="flex flex-wrap gap-2">
              {options.map((o) => {
                const on = selected.includes(o.value);
                return (
                  <button
                    key={o.value}
                    type="button"
                    aria-pressed={on}
                    onClick={() => field.onChange(on ? selected.filter((v) => v !== o.value) : [...selected, o.value])}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm transition-colors",
                      on ? "border-foreground bg-foreground text-background" : "hover:border-foreground/50",
                    )}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
