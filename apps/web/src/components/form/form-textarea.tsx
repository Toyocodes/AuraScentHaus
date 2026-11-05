"use client";

import type { ComponentProps, ReactNode } from "react";
import { useFormContext, type FieldPath, type FieldValues } from "react-hook-form";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

export interface FormTextareaProps<T extends FieldValues>
  extends Omit<ComponentProps<typeof Textarea>, "name" | "value" | "defaultValue" | "onChange" | "onBlur"> {
  name: FieldPath<T>;
  label?: ReactNode;
  description?: ReactNode;
  itemClassName?: string;
}

export function FormTextarea<T extends FieldValues>({
  name,
  label,
  description,
  itemClassName,
  ...textareaProps
}: FormTextareaProps<T>) {
  const { control } = useFormContext<T>();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={itemClassName}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <Textarea {...textareaProps} {...field} value={(field.value as string | undefined) ?? ""} />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
