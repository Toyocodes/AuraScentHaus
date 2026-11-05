"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FormInput, FormSelect } from "@/components/form";
import { Form } from "@/components/ui/form";
import { GENDER_OPTIONS, SORT_OPTIONS } from "./filter-options";
import {
  DEFAULT_FILTERS,
  productFilterSchema,
  toFilterParams,
  type ProductFilterParams,
  type ProductFilterValues,
} from "./filter-schema";

interface ProductFiltersProps {
  defaultValues?: Partial<ProductFilterValues>;
  /** Called on Enter in the search box and whenever a dropdown changes. */
  onChange?: (params: ProductFilterParams) => void;
}

export function ProductFilters({ defaultValues, onChange }: ProductFiltersProps) {
  const form = useForm({
    resolver: zodResolver(productFilterSchema),
    defaultValues: { ...DEFAULT_FILTERS, ...defaultValues },
  });

  const apply = form.handleSubmit((values) => onChange?.(toFilterParams(values)));

  return (
    <Form {...form}>
      <form onSubmit={apply} className="flex flex-col gap-3 sm:flex-row sm:items-start" role="search">
        <FormInput<ProductFilterValues>
          name="search"
          type="search"
          placeholder="Search perfumes or brands…"
          aria-label="Search perfumes"
          itemClassName="flex-1"
        />
        <FormSelect<ProductFilterValues>
          name="gender"
          options={GENDER_OPTIONS}
          triggerClassName="sm:w-40"
          onValueChange={() => void apply()}
        />
        <FormSelect<ProductFilterValues>
          name="sort"
          options={SORT_OPTIONS}
          triggerClassName="sm:w-48"
          onValueChange={() => void apply()}
        />
      </form>
    </Form>
  );
}
