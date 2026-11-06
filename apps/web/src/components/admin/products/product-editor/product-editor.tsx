"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import type { CategoryDTO, ProductDetailDTO, ProductInput, ScentFamilyDTO } from "@aurascenthaus/shared";
import { ConfirmDialog, PageHeader } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ImageManager, type ImageManagerProps } from "../image-manager/image-manager";
import { ProductForm } from "../product-form/product-form";
import { VariantManager, type VariantManagerProps } from "../variant-manager/variant-manager";

interface ProductEditorProps {
  product: ProductDetailDTO;
  categories?: CategoryDTO[];
  scentFamilies?: ScentFamilyDTO[];
  /** From `usePermission().can("products:delete")`. */
  canDelete?: boolean;
  isSaving?: boolean;
  onSave?: (input: ProductInput) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
  images?: Omit<ImageManagerProps, "images">;
  variants?: Omit<VariantManagerProps, "variants">;
}

/** The admin product page: images, sizes and details in one place. */
export function ProductEditor({
  product,
  categories,
  scentFamilies,
  canDelete = true,
  isSaving,
  onSave,
  onDelete,
  images,
  variants,
}: ProductEditorProps) {
  return (
    <div className="space-y-10">
      <PageHeader
        title={product.name}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href={`/products/${product.slug}`} target="_blank">
                View in store
              </Link>
            </Button>
            {canDelete && (
              <ConfirmDialog
                trigger={<Button variant="destructive">Delete</Button>}
                title={`Delete ${product.name}?`}
                description="This can't be undone. Past orders keep their details."
                confirmLabel="Delete product"
                destructive
                onConfirm={onDelete}
              />
            )}
          </>
        }
      />

      <EditorSection title="Images">
        <ImageManager images={product.images} {...images} />
      </EditorSection>
      <Separator />
      <EditorSection title="Sizes, prices & stock">
        <VariantManager variants={product.variants} defaultUnit={product.category?.defaultSizeUnit} {...variants} />
      </EditorSection>
      <Separator />
      <EditorSection title="Details">
        <ProductForm key={product.id} product={product} categories={categories} scentFamilies={scentFamilies} isPending={isSaving} onSubmit={onSave} />
      </EditorSection>
    </div>
  );
}

function EditorSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl">{title}</h2>
      {children}
    </section>
  );
}
