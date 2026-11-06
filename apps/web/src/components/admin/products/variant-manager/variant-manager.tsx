"use client";

import type { UpdateVariantInput, VariantDTO, VariantInput, SizeUnit } from "@aurascenthaus/shared";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AddVariantForm } from "./add-variant-form";
import { VariantRow } from "./variant-row";

export interface VariantManagerProps {
  variants: VariantDTO[];
  /** The unit a new size starts in. */
  defaultUnit?: SizeUnit;
  isPending?: boolean;
  onAdd?: (input: VariantInput) => void | Promise<void>;
  onUpdate?: (variantId: string, input: UpdateVariantInput) => void | Promise<void>;
  onDelete?: (variantId: string) => void | Promise<void>;
}

/** Sizes, prices and stock of an existing product. Prices are typed in naira. */
export function VariantManager({ variants, defaultUnit, isPending, onAdd, onUpdate, onDelete }: VariantManagerProps) {
  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Size</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Price (₦)</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {variants.map((v) => (
            <VariantRow key={v.id} variant={v} disabled={isPending} onUpdate={onUpdate} onDelete={onDelete} />
          ))}
        </TableBody>
      </Table>
      <AddVariantForm defaultUnit={defaultUnit} isPending={isPending} onSubmit={onAdd} />
    </div>
  );
}
