"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FormInput, FormSelect } from "@/components/form";
import { Form } from "@/components/ui/form";
import { SORT_OPTIONS } from "./filter-options";
import { productFilterSchema, type ProductFilterValues } from "./filter-schema";

interface ProductFiltersProps {
  defaultValues?: Partial<ProductFilterValues>;
  /** Called on Enter in the search box and when the sort changes. */
  onChange?: (values: ProductFilterValues) => void;
}

/** The search box and sort above the products. The other filters are in the filter panel. */
export function ProductFilters({ defaultValues, onChange }: ProductFiltersProps) {
  const form = useForm({
    resolver: zodResolver(productFilterSchema),
    defaultValues: { search: "", sort: "newest" as const, ...defaultValues },
  });

  const apply = form.handleSubmit((values) => onChange?.(values));

  return (
    <Form {...form}>
      <form onSubmit={apply} className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-start" role="search">
        <FormInput<ProductFilterValues>
          name="search"
          type="search"
          placeholder="Search the collection…"
          aria-label="Search products"
          itemClassName="flex-1"
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
