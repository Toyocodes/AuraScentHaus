"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { SIZE_UNIT_LABELS, SIZE_UNITS, type CategoryDTO, type CategoryInput } from "@aurascenthaus/shared";
import { FormCheckbox, FormInput, FormSelect, FormTextarea, quietly, SubmitButton } from "@/components/form";
import { Form } from "@/components/ui/form";
import { branchIds, categoryOptions } from "../category-options";
import {
  categoryFormSchema,
  NO_PARENT,
  toCategoryFormValues,
  toCategoryInput,
  type CategoryFormValues,
} from "./category-schema";

const UNIT_OPTIONS = SIZE_UNITS.map((u) => ({ value: u, label: SIZE_UNIT_LABELS[u] }));

interface CategoryFormProps {
  /** Leave out to create a new category. */
  category?: CategoryDTO;
  /** Starts a new category under this parent. */
  parentId?: string;
  /** Every category, for the parent dropdown. */
  categories: CategoryDTO[];
  isPending?: boolean;
  onSubmit?: (input: CategoryInput) => void | Promise<void>;
}

export function CategoryForm({ category, parentId, categories, isPending, onSubmit }: CategoryFormProps) {
  const form = useForm({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: toCategoryFormValues(category, parentId),
  });

  // A category can't move inside itself.
  const blocked = category ? branchIds(categories, category.id) : new Set<string>();
  const parentOptions = [
    { value: NO_PARENT, label: "None (a main category)" },
    ...categoryOptions(categories, { exclude: (id) => blocked.has(id) }),
  ];

  return (
    <Form {...form}>
      <form
        className="space-y-4"
        noValidate
        onSubmit={form.handleSubmit((values) => quietly(() => onSubmit?.(toCategoryInput(values)))(undefined))}
      >
        <FormInput<CategoryFormValues> name="name" label="Name" placeholder="e.g. Scented Candles" />
        <FormSelect<CategoryFormValues> name="parentId" label="Parent category" options={parentOptions} />
        <FormTextarea<CategoryFormValues> name="description" label="Description (optional)" rows={3} maxLength={500} />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput<CategoryFormValues>
            name="position"
            label="Display order"
            type="number"
            min={0}
            description="Lower numbers come first."
          />
          <FormSelect<CategoryFormValues>
            name="defaultSizeUnit"
            label="Sizes measured in"
            options={UNIT_OPTIONS}
            description="Where new sizes start."
          />
        </div>
        <FormCheckbox<CategoryFormValues> name="isActive" label="Active" description="Inactive categories and their products are hidden from shoppers." />
        <FormCheckbox<CategoryFormValues> name="usesGender" label="Products are for men, women or unisex" description="Shows the gender field and filter. Subcategories inherit this." />
        <SubmitButton className="w-full" isPending={isPending}>
          {category ? "Save changes" : "Add category"}
        </SubmitButton>
      </form>
    </Form>
  );
}
