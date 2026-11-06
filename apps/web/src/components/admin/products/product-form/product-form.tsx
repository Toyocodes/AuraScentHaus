"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import {
  GENDERS,
  type CategoryDTO,
  type ProductDetailDTO,
  type ProductInput,
  type ScentFamilyDTO,
} from "@aurascenthaus/shared";
import { categoryOptions } from "@/components/admin/categories/category-options";
import {
  FormCheckbox,
  FormChipSelect,
  FormInput,
  FormSelect,
  FormTextarea,
  quietly,
  SubmitButton,
} from "@/components/form";
import { Form } from "@/components/ui/form";
import { humanize } from "@/lib/format";
import { productFormSchema, toProductFormValues, toProductInput, type ProductFormValues } from "../product-schema";
import { FragrancePyramidFields } from "./fragrance-pyramid-fields";
import { VariantFields } from "./variant-fields";

const GENDER_OPTIONS = GENDERS.map((g) => ({ value: g, label: humanize(g) }));

interface ProductFormProps {
  /** Leave out to create a new product. */
  product?: ProductDetailDTO;
  categories?: CategoryDTO[];
  scentFamilies?: ScentFamilyDTO[];
  isPending?: boolean;
  /** Wire to `useCreateProduct()` or `useUpdateProduct()`. */
  onSubmit?: (input: ProductInput) => void | Promise<void>;
}

/** Create a product (with its sizes), or edit an existing product's details. */
export function ProductForm({ product, categories = [], scentFamilies = [], isPending, onSubmit }: ProductFormProps) {
  const isNew = !product;
  const form = useForm({
    resolver: zodResolver(productFormSchema),
    defaultValues: toProductFormValues(product),
  });

  const categoryId = useWatch({ control: form.control, name: "categoryId" });
  const category = categories.find((c) => c.id === categoryId);
  const allowNotes = category?.hasFragrancePyramid ?? false;
  const usesGender = category?.usesGender ?? false;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) =>
          quietly(() => onSubmit?.(toProductInput(values, { withVariants: isNew, allowNotes, usesGender })))(undefined),
        )}
        className="max-w-2xl space-y-6"
        noValidate
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput<ProductFormValues> name="name" label="Name" itemClassName="sm:col-span-2" />
          <FormSelect<ProductFormValues>
            name="categoryId"
            label="Category"
            placeholder="Choose a category"
            options={categoryOptions(categories)}
            itemClassName="sm:col-span-2"
          />
          <FormInput<ProductFormValues> name="brand" label="Brand" />
          {usesGender && <FormSelect<ProductFormValues> name="gender" label="For" options={GENDER_OPTIONS} />}
          <FormTextarea<ProductFormValues> name="description" label="Description" rows={4} itemClassName="sm:col-span-2" />
          <FormChipSelect<ProductFormValues>
            name="scentFamilyIds"
            label="Scent families"
            description="What it smells like. Choose as many as fit."
            options={scentFamilies.map((s) => ({ value: s.id, label: s.isActive ? s.name : `${s.name} (inactive)` }))}
            itemClassName="sm:col-span-2"
          />
        </div>

        <FragrancePyramidFields allowNotes={allowNotes} categoryName={category?.name} />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormCheckbox<ProductFormValues> name="isActive" label="Visible in store" />
          <FormCheckbox<ProductFormValues> name="isFeatured" label="Featured on home page" />
        </div>

        {isNew && <VariantFields defaultUnit={category?.defaultSizeUnit} />}

        <SubmitButton isPending={isPending}>{isNew ? "Create product" : "Save changes"}</SubmitButton>
      </form>
    </Form>
  );
}
