"use client";

import { useState, type ReactNode } from "react";
import type { CategoryDTO, CategoryInput } from "@aurascenthaus/shared";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CategoryForm } from "../category-form/category-form";

interface CategoryDialogProps {
  trigger: ReactNode;
  /** Leave out to add a new category. */
  category?: CategoryDTO;
  /** Starts a new category under this parent. */
  parentId?: string;
  categories: CategoryDTO[];
  isPending?: boolean;
  onSubmit?: (input: CategoryInput) => void | Promise<void>;
}

/** Add or edit a category in a pop-up. Closes after a successful save. */
export function CategoryDialog({ trigger, category, parentId, categories, isPending, onSubmit }: CategoryDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90svh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">{category ? `Edit ${category.name}` : "Add a category"}</DialogTitle>
          <DialogDescription>Each category gets its own page in the store once it has products.</DialogDescription>
        </DialogHeader>
        <CategoryForm
          key={String(open)}
          category={category}
          parentId={parentId}
          categories={categories}
          isPending={isPending}
          onSubmit={async (input) => {
            await onSubmit?.(input);
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
