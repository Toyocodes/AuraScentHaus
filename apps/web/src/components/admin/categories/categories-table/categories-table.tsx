"use client";

import { useRef, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ImagePlus, Plus } from "lucide-react";
import type { CategoryInput, CategoryWithCountDTO } from "@aurascenthaus/shared";
import { EmptyState } from "@/components/common";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { inTreeOrder } from "../category-options";
import { CategoryDialog } from "../category-dialog/category-dialog";
import { DeleteCategoryDialog } from "./delete-category-dialog";

export interface CategoriesTableProps {
  categories: CategoryWithCountDTO[];
  canEdit?: boolean;
  canDelete?: boolean;
  isSaving?: boolean;
  isDeleting?: boolean;
  onCreate?: (input: CategoryInput) => void | Promise<void>;
  onUpdate?: (categoryId: string, input: CategoryInput) => void | Promise<void>;
  onDelete?: (categoryId: string, reassignTo: string | undefined) => void | Promise<void>;
  onUploadImage?: (categoryId: string, file: File) => void | Promise<void>;
}

/** The whole category tree, with subcategories indented under their parents. */
export function CategoriesTable({
  categories,
  canEdit = true,
  canDelete = true,
  isSaving,
  isDeleting,
  onCreate,
  onUpdate,
  onDelete,
  onUploadImage,
}: CategoriesTableProps) {
  if (categories.length === 0) {
    return <EmptyState title="No categories yet" description="Add a main category to get started." />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Category</TableHead>
          <TableHead>Store page</TableHead>
          <TableHead>Products</TableHead>
          <TableHead>Status</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {inTreeOrder(categories).map(({ category: c, depth }) => (
          <TableRow key={c.id} className={c.isActive ? undefined : "opacity-60"}>
            <TableCell>
              <div className="flex items-center gap-3" style={{ paddingLeft: `${depth * 1.5}rem` }}>
                <CategoryImage category={c} canEdit={canEdit} onUpload={onUploadImage} />
                <span className={depth === 0 ? "font-heading text-lg" : "font-medium"}>{c.name}</span>
                {c.hasFragrancePyramid && <Badge variant="outline">Notes</Badge>}
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground">
              <Link href={`/shop/${c.slug}`} target="_blank" className="hover:underline">
                /shop/{c.slug}
              </Link>
            </TableCell>
            <TableCell>
              <Link href={`/admin/products?category=${c.slug}`} className="tabular-nums underline-offset-4 hover:underline">
                {c.productCount}
              </Link>
            </TableCell>
            <TableCell>
              <Badge variant={c.isActive ? "secondary" : "outline"}>{c.isActive ? "Active" : "Inactive"}</Badge>
            </TableCell>
            <TableCell className="space-x-1 text-right whitespace-nowrap">
              {canEdit && depth < 2 && (
                <CategoryDialog
                  trigger={
                    <Button size="xs" variant="ghost" aria-label={`Add a subcategory to ${c.name}`}>
                      <Plus /> Sub
                    </Button>
                  }
                  parentId={c.id}
                  categories={categories}
                  isPending={isSaving}
                  onSubmit={onCreate}
                />
              )}
              {canEdit && (
                <CategoryDialog
                  trigger={
                    <Button size="xs" variant="outline">
                      Edit
                    </Button>
                  }
                  category={c}
                  categories={categories}
                  isPending={isSaving}
                  onSubmit={(input) => onUpdate?.(c.id, input)}
                />
              )}
              {canDelete && (
                <DeleteCategoryDialog
                  trigger={
                    <Button size="xs" variant="ghost">
                      Delete
                    </Button>
                  }
                  category={c}
                  categories={categories}
                  isPending={isDeleting}
                  onConfirm={(reassignTo) => onDelete?.(c.id, reassignTo)}
                />
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function CategoryImage({
  category,
  canEdit,
  onUpload,
}: {
  category: CategoryWithCountDTO;
  canEdit: boolean;
  onUpload?: (categoryId: string, file: File) => void | Promise<void>;
}) {
  const input = useRef<HTMLInputElement>(null);

  const picture: ReactNode = category.imageUrl ? (
    <Image src={category.imageUrl} alt="" fill sizes="36px" className="object-cover" />
  ) : (
    <ImagePlus className="size-4 text-muted-foreground" />
  );

  if (!canEdit) {
    return <span className="relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-sm bg-muted">{picture}</span>;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => input.current?.click()}
        aria-label={`Change the picture for ${category.name}`}
        className="relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-sm bg-muted hover:opacity-80"
      >
        {picture}
      </button>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={async (event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) return;
          try {
            await onUpload?.(category.id, file);
          } catch {
            // The parent has shown why it failed.
          }
        }}
      />
    </>
  );
}
