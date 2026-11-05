"use client";

import type { ReactNode } from "react";
import { useFormContext, type FieldPath, type FieldValues } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";

export interface FormCheckboxProps<T extends FieldValues> {
  name: FieldPath<T>;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  itemClassName?: string;
}

export function FormCheckbox<T extends FieldValues>({
  name,
  label,
  description,
  disabled,
  itemClassName,
}: FormCheckboxProps<T>) {
  const { control } = useFormContext<T>();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("flex flex-row items-start gap-2", itemClassName)}>
          <FormControl>
            <Checkbox
              checked={field.value === true}
              onCheckedChange={(checked) => field.onChange(checked === true)}
              onBlur={field.onBlur}
              disabled={disabled}
            />
          </FormControl>
          <div className="grid gap-1">
            <FormLabel className="font-normal">{label}</FormLabel>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
}
