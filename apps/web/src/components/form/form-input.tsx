"use client";

import type { ComponentProps, ReactNode } from "react";
import { useFormContext, type FieldPath, type FieldValues } from "react-hook-form";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export interface FormInputProps<T extends FieldValues>
  extends Omit<ComponentProps<typeof Input>, "name" | "value" | "defaultValue" | "onChange" | "onBlur"> {
  name: FieldPath<T>;
  label?: ReactNode;
  description?: ReactNode;
  /** Class for the wrapping FormItem (e.g. grid spans). */
  itemClassName?: string;
}

/**
 * A labelled text input wired to the surrounding <Form> (react-hook-form's FormProvider).
 *   <FormInput<ProfileValues> name="phone" label="Phone" type="tel" />
 */
export function FormInput<T extends FieldValues>({
  name,
  label,
  description,
  itemClassName,
  ...inputProps
}: FormInputProps<T>) {
  const { control } = useFormContext<T>();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={itemClassName}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <Input {...inputProps} {...field} value={(field.value as string | number | undefined) ?? ""} />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
