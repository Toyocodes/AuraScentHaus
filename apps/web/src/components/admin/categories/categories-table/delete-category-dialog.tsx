"use client";

import { useState, type ReactNode } from "react";
import type { CategoryWithCountDTO } from "@aurascenthaus/shared";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { categoryOptions } from "../category-options";

interface DeleteCategoryDialogProps {
  trigger: ReactNode;
  category: CategoryWithCountDTO;
  categories: CategoryWithCountDTO[];
  isPending?: boolean;
  /** Rejects if the delete fails, which keeps the dialog open. */
  onConfirm?: (reassignTo: string | undefined) => void | Promise<void>;
}

/** Deleting asks where its products should go, so none are left without a category. */
export function DeleteCategoryDialog({ trigger, category, categories, isPending, onConfirm }: DeleteCategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [reassignTo, setReassignTo] = useState<string>();

  const count = category.directProductCount;
  const hasChildren = categories.some((c) => c.parentId === category.id);
  const protectedCategory = category.hasFragrancePyramid && isPyramidRoot(category, categories);
  const blockedReason = protectedCategory
    ? `Fragrance notes depend on ${category.name}, so it can't be deleted. You can deactivate it instead.`
    : hasChildren
      ? "Move or delete its subcategories first."
      : null;

  const options = categoryOptions(categories, { exclude: (id) => id === category.id });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setReassignTo(undefined);
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {category.name}?</DialogTitle>
          <DialogDescription>
            {blockedReason ??
              (count > 0
                ? `It has ${count} ${count === 1 ? "product" : "products"}. Choose where to move ${count === 1 ? "it" : "them"} first.`
                : "It has no products. This can't be undone.")}
          </DialogDescription>
        </DialogHeader>

        {!blockedReason && count > 0 && (
          <div className="grid gap-2">
            <Label htmlFor="reassign-category">Move products to</Label>
            <Select value={reassignTo ?? ""} onValueChange={setReassignTo}>
              <SelectTrigger id="reassign-category" className="w-full">
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                {options.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{blockedReason ? "Close" : "Keep it"}</Button>
          </DialogClose>
          {!blockedReason && (
            <Button
              variant="destructive"
              disabled={isPending || (count > 0 && !reassignTo)}
              onClick={async () => {
                try {
                  await onConfirm?.(reassignTo);
                  setOpen(false);
                } catch {
                  // Stay open: the parent has shown why it failed.
                }
              }}
            >
              {isPending ? "Working…" : count > 0 ? "Move products and delete" : "Delete category"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** The category that switches the pyramid on, rather than one inheriting it from a parent. */
function isPyramidRoot(category: CategoryWithCountDTO, categories: CategoryWithCountDTO[]) {
  const parent = categories.find((c) => c.id === category.parentId);
  return !parent?.hasFragrancePyramid;
}
