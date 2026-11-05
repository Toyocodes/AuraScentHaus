"use client";

import type { ReactNode } from "react";
import { useFormContext, type FieldPath, type FieldValues } from "react-hook-form";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

export interface FormSelectProps<T extends FieldValues> {
  name: FieldPath<T>;
  options: readonly SelectOption[];
  label?: ReactNode;
  description?: ReactNode;
  placeholder?: string;
  disabled?: boolean;
  itemClassName?: string;
  triggerClassName?: string;
  /** Runs after the form value changes (e.g. to apply a filter immediately). */
  onValueChange?: (value: string) => void;
}

export function FormSelect<T extends FieldValues>({
  name,
  options,
  label,
  description,
  placeholder,
  disabled,
  itemClassName,
  triggerClassName,
  onValueChange,
}: FormSelectProps<T>) {
  const { control } = useFormContext<T>();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={itemClassName}>
          {label && <FormLabel>{label}</FormLabel>}
          <Select
            value={(field.value as string | undefined) ?? ""}
            disabled={disabled}
            onValueChange={(value) => {
              field.onChange(value);
              onValueChange?.(value);
            }}
          >
            <FormControl>
              <SelectTrigger className={cn("w-full", triggerClassName)} onBlur={field.onBlur}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
