"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { nairaToKobo, type UpdateVariantInput, type VariantDTO } from "@aurascenthaus/shared";
import { ConfirmDialog } from "@/components/common";
import { FormInput, quietly } from "@/components/form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { TableCell, TableRow } from "@/components/ui/table";
import { toVariantStockValues, variantStockSchema, type VariantStockValues } from "../product-schema";

interface VariantRowProps {
  variant: VariantDTO;
  disabled?: boolean;
  onUpdate?: (variantId: string, input: UpdateVariantInput) => void | Promise<void>;
  onDelete?: (variantId: string) => void | Promise<void>;
}

/** One size: edit price and stock inline, hide/show it, or delete it. */
export function VariantRow({ variant, disabled, onUpdate, onDelete }: VariantRowProps) {
  const form = useForm({
    resolver: zodResolver(variantStockSchema),
    defaultValues: toVariantStockValues(variant),
  });
  const formId = `variant-${variant.id}`;

  return (
    <TableRow className={variant.isActive ? undefined : "opacity-50"}>
      <TableCell>{variant.sizeMl}ml</TableCell>
      <TableCell className="text-muted-foreground">{variant.sku}</TableCell>
      <TableCell colSpan={2}>
        <Form {...form}>
          <form
            id={formId}
            className="flex items-start gap-2"
            onSubmit={form.handleSubmit(({ price, stock }) =>
              quietly(async () => {
                await onUpdate?.(variant.id, { price: nairaToKobo(price), stock });
                form.reset({ price: String(price), stock: String(stock) });
              })(undefined),
            )}
          >
            <FormInput<VariantStockValues> name="price" type="number" min={0} className="w-28" aria-label="Price in naira" />
            <FormInput<VariantStockValues> name="stock" type="number" min={0} className="w-20" aria-label="Stock" />
          </form>
        </Form>
      </TableCell>
      <TableCell className="space-x-1 text-right whitespace-nowrap">
        <Button size="xs" type="submit" form={formId} disabled={disabled || !form.formState.isDirty}>
          Save
        </Button>
        <Button
          size="xs"
          variant="outline"
          disabled={disabled}
          onClick={() => void quietly(() => onUpdate?.(variant.id, { isActive: !variant.isActive }))(undefined)}
        >
          {variant.isActive ? "Hide" : "Show"}
        </Button>
        <ConfirmDialog
          trigger={
            <Button size="xs" variant="ghost" disabled={disabled}>
              Delete
            </Button>
          }
          title={`Delete the ${variant.sizeMl}ml size?`}
          description="Past orders keep their details. To stop selling it for now, hide it instead."
          confirmLabel="Delete size"
          destructive
          onConfirm={() => onDelete?.(variant.id)}
        />
      </TableCell>
    </TableRow>
  );
}
