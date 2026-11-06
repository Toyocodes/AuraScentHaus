"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { CategoryInput } from "@aurascenthaus/shared";
import { FormInput, SubmitButton, quietly } from "@/components/form";
import { Form } from "@/components/ui/form";
import { categoryFormSchema, EMPTY_CATEGORY, toCategoryInput, type CategoryFormValues } from "./category-schema";

interface CategoryFormProps {
  defaultValues?: CategoryFormValues;
  submitLabel?: string;
  isPending?: boolean;
  /** Wire to `useCreateCategory().mutateAsync` (or `useUpdateCategory`). */
  onSubmit?: (input: CategoryInput) => void | Promise<void>;
}

export function CategoryForm({
  defaultValues = EMPTY_CATEGORY,
  submitLabel = "Add category",
  isPending,
  onSubmit,
}: CategoryFormProps) {
  const form = useForm({ resolver: zodResolver(categoryFormSchema), defaultValues });

  return (
    <Form {...form}>
      <form
        className="flex flex-wrap items-start gap-2"
        noValidate
        onSubmit={form.handleSubmit(
          quietly(async (values: CategoryFormValues) => {
            await onSubmit?.(toCategoryInput(values));
            form.reset(EMPTY_CATEGORY);
          }),
        )}
      >
        <FormInput<CategoryFormValues> name="name" placeholder="Name, e.g. Gourmand" aria-label="Name" itemClassName="w-56" />
        <FormInput<CategoryFormValues>
          name="description"
          placeholder="Short description (optional)"
          aria-label="Description"
          itemClassName="min-w-64 flex-1"
        />
        <SubmitButton isPending={isPending}>{submitLabel}</SubmitButton>
      </form>
    </Form>
  );
}
