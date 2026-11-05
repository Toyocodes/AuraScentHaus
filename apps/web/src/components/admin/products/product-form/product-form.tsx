"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { GENDERS, type CategoryDTO, type ProductDetailDTO, type ProductInput } from "@aurascenthaus/shared";
import { FormCheckbox, FormInput, FormSelect, FormTextarea, SubmitButton } from "@/components/form";
import { Form } from "@/components/ui/form";
import { humanize } from "@/lib/format";
import {
  NO_CATEGORY,
  productFormSchema,
  toProductFormValues,
  toProductInput,
  type ProductFormValues,
} from "../product-schema";
import { VariantFields } from "./variant-fields";

const GENDER_OPTIONS = GENDERS.map((g) => ({ value: g, label: humanize(g) }));
const NOTE_FIELDS = [
  { name: "topNotes", label: "Top notes" },
  { name: "heartNotes", label: "Heart notes" },
  { name: "baseNotes", label: "Base notes" },
] as const;

interface ProductFormProps {
  /** Leave out to create a new product. */
  product?: ProductDetailDTO;
  categories?: CategoryDTO[];
  isPending?: boolean;
  /** Wire to `useCreateProduct()` or `useUpdateProduct()`. */
  onSubmit?: (input: ProductInput) => void | Promise<void>;
}

/** Create a product (with its sizes), or edit an existing product's details. */
export function ProductForm({ product, categories = [], isPending, onSubmit }: ProductFormProps) {
  const isNew = !product;
  const form = useForm({
    resolver: zodResolver(productFormSchema),
    defaultValues: toProductFormValues(product),
  });

  const categoryOptions = [{ value: NO_CATEGORY, label: "No category" }, ...categories.map((c) => ({ value: c.id, label: c.name }))];

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (values) => onSubmit?.(toProductInput(values, { withVariants: isNew })))}
        className="max-w-2xl space-y-6"
        noValidate
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput<ProductFormValues> name="name" label="Name" itemClassName="sm:col-span-2" />
          <FormInput<ProductFormValues> name="brand" label="Brand" />
          <FormSelect<ProductFormValues> name="categoryId" label="Category" options={categoryOptions} />
          <FormSelect<ProductFormValues> name="gender" label="For" options={GENDER_OPTIONS} />
          <FormTextarea<ProductFormValues> name="description" label="Description" rows={4} itemClassName="sm:col-span-2" />
          {NOTE_FIELDS.map((f) => (
            <FormInput<ProductFormValues>
              key={f.name}
              name={f.name}
              label={f.label}
              description="Separate notes with commas"
              placeholder="Bergamot, Pink Pepper"
              itemClassName="sm:col-span-2"
            />
          ))}
          <FormCheckbox<ProductFormValues> name="isActive" label="Visible in store" />
          <FormCheckbox<ProductFormValues> name="isFeatured" label="Featured on home page" />
        </div>

        {isNew && <VariantFields />}

        <SubmitButton isPending={isPending}>{isNew ? "Create product" : "Save changes"}</SubmitButton>
      </form>
    </Form>
  );
}
