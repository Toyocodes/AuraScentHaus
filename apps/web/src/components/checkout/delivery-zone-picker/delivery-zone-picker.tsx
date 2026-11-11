"use client";

import { useFormContext } from "react-hook-form";
import type { DeliveryZoneDTO } from "@aurascenthaus/shared";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatNaira } from "@/lib/format";
import type { CheckoutFormValues } from "../checkout-form/checkout-schema";

/** What each option covers, under its name. */
function coverage(zone: DeliveryZoneDTO): string {
  if (zone.kind === "LAGOS_AXIS") return zone.areas.join(", ");
  if (zone.kind === "LAGOS_OTHER") return "Any part of Lagos not listed above";
  return "Every state outside Lagos";
}

/**
 * "Pick your delivery fee": a dropdown of the delivery options (each Lagos axis with its areas,
 * other Lagos areas, other states). The customer picks the one their address is in and its fee
 * is added to the total. Bound to the form's `deliveryZoneId`.
 */
export function DeliveryZonePicker({ zones }: { zones: DeliveryZoneDTO[] }) {
  const { control } = useFormContext<CheckoutFormValues>();
  const lagos = zones.filter((z) => z.kind !== "NIGERIA");
  const otherStates = zones.filter((z) => z.kind === "NIGERIA");

  const item = (zone: DeliveryZoneDTO) => (
    <SelectItem key={zone.id} value={zone.id} className="py-2.5 pl-3">
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-baseline justify-between gap-4">
          <span className="font-semibold">{zone.name}</span>
          <span className="font-semibold whitespace-nowrap tabular-nums">{formatNaira(zone.fee)}</span>
        </span>
        <span className="text-xs whitespace-normal text-muted-foreground">{coverage(zone)}</span>
      </span>
    </SelectItem>
  );

  return (
    <FormField
      control={control}
      name="deliveryZoneId"
      render={({ field }) => {
        const selected = zones.find((z) => z.id === field.value);
        return (
          <FormItem className="space-y-2">
            <FormLabel className="font-heading text-2xl font-normal">Pick your delivery fee</FormLabel>
            <p className="text-sm text-muted-foreground">
              Choose the area your address is in. Its fee is added to your total.
            </p>
            <Select value={field.value || ""} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger className="h-12! w-full px-4 text-base" onBlur={field.onBlur}>
                  <SelectValue placeholder="Select your delivery area">
                    {selected && (
                      <span className="flex w-full items-baseline justify-between gap-4">
                        <span className="truncate">{selected.name}</span>
                        <span className="font-semibold tabular-nums">{formatNaira(selected.fee)}</span>
                      </span>
                    )}
                  </SelectValue>
                </SelectTrigger>
              </FormControl>
              <SelectContent position="popper" className="max-h-80">
                {lagos.map(item)}
                {otherStates.length > 0 && lagos.length > 0 && <SelectSeparator />}
                {otherStates.map(item)}
              </SelectContent>
            </Select>
            {selected && (
              <p className="text-xs text-muted-foreground">
                {coverage(selected)}
                {selected.deliveryTime && ` · ${selected.deliveryTime}`}
              </p>
            )}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
