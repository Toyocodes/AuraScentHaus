"use client";

import type { ReactNode } from "react";
import { useFormContext, type FieldPath, type FieldValues } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";

export interface ChoiceCardOption {
  value: string;
  label: string;
  description?: string;
  icon?: ReactNode;
}

interface FormChoiceCardsProps<T extends FieldValues> {
  name: FieldPath<T>;
  options: readonly ChoiceCardOption[];
  label?: ReactNode;
  disabled?: boolean;
  className?: string;
}

/** A radio group shown as tappable cards (payment method, customer type…). */
export function FormChoiceCards<T extends FieldValues>({ name, options, label, disabled, className }: FormChoiceCardsProps<T>) {
  const { control } = useFormContext<T>();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <div role="radiogroup" className={cn("grid gap-2 sm:grid-cols-3", className)}>
              {options.map((o) => {
                const selected = field.value === o.value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    disabled={disabled}
                    onClick={() => field.onChange(o.value)}
                    className={cn(
                      "flex items-start gap-3 rounded-sm border bg-card p-4 text-left text-sm transition-colors disabled:opacity-50",
                      selected ? "border-foreground ring-1 ring-foreground" : "hover:border-foreground/40",
                    )}
                  >
                    {o.icon && <span className="mt-0.5 text-gold [&_svg]:size-4">{o.icon}</span>}
                    <span className="space-y-0.5">
                      <span className="block font-medium">{o.label}</span>
                      {o.description && <span className="block text-xs text-muted-foreground">{o.description}</span>}
                    </span>
                  </button>
                );
              })}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
