"use client";

import { useState, type KeyboardEvent, type ReactNode } from "react";
import { X } from "lucide-react";
import { useFormContext, type FieldPath, type FieldValues } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export interface FormTagsInputProps<T extends FieldValues> {
  /** A field holding string[]. */
  name: FieldPath<T>;
  label?: ReactNode;
  description?: ReactNode;
  placeholder?: string;
  itemClassName?: string;
}

/** Add values one at a time with Enter or a comma, and remove each with its ×. */
export function FormTagsInput<T extends FieldValues>({ name, label, description, placeholder, itemClassName }: FormTagsInputProps<T>) {
  const { control } = useFormContext<T>();
  const [text, setText] = useState("");

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const tags = (field.value as string[] | undefined) ?? [];

        const add = () => {
          const value = text.trim().replace(/,$/, "").trim();
          setText("");
          if (value && !tags.some((t) => t.toLowerCase() === value.toLowerCase())) field.onChange([...tags, value]);
        };
        const remove = (tag: string) => field.onChange(tags.filter((t) => t !== tag));

        const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
          if (event.key === "Enter" || event.key === ",") {
            // Enter adds a note here. It must not submit the whole form.
            event.preventDefault();
            add();
          } else if (event.key === "Backspace" && !text && tags.length > 0) {
            remove(tags[tags.length - 1]!);
          }
        };

        return (
          <FormItem className={itemClassName}>
            {label && <FormLabel>{label}</FormLabel>}
            {tags.length > 0 && (
              <ul className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <li key={tag}>
                    <Badge variant="secondary" className="gap-1 pr-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => remove(tag)}
                        aria-label={`Remove ${tag}`}
                        className="rounded-full p-0.5 hover:bg-background/60"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
            <FormControl>
              <Input
                value={text}
                placeholder={placeholder}
                onChange={(event) => setText(event.target.value)}
                onKeyDown={onKeyDown}
                onBlur={() => {
                  add();
                  field.onBlur();
                }}
              />
            </FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
