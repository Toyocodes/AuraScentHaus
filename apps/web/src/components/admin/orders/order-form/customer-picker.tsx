"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { Search, X } from "lucide-react";
import { useFormContext } from "react-hook-form";
import type { UserDTO } from "@aurascenthaus/shared";
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCustomers } from "@/hooks/admin/customers";
import { useDebouncedValue } from "@/hooks/helper/useDebouncedValue";
import { cn } from "@/lib/utils";
import type { OrderFormValues } from "./order-form-schema";

const MAX_RESULTS = 8;

export type PickedCustomer = Pick<UserDTO, "id" | "email" | "name" | "phone">;

/**
 * Find a customer by name, email or phone. Results come from the API as you type,
 * so this works however many customers the shop has. Sets the form's `customerId`.
 */
export function CustomerPicker({
  picked,
  onPickedChange,
}: {
  /** Held by the parent, so it survives switching to "Walk-in" and back. */
  picked: PickedCustomer | null;
  onPickedChange: (customer: PickedCustomer | null) => void;
}) {
  const { control, setValue, clearErrors } = useFormContext<OrderFormValues>();

  return (
    <FormField
      control={control}
      name="customerId"
      render={() => (
        <FormItem>
          <FormLabel>Customer</FormLabel>
          {picked ? (
            <div className="flex items-center justify-between gap-4 rounded-sm border bg-card p-3">
              <CustomerText customer={picked} />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  onPickedChange(null);
                  setValue("customerId", "");
                }}
              >
                <X /> Change
              </Button>
            </div>
          ) : (
            <CustomerSearch
              onPick={(customer) => {
                onPickedChange(customer);
                setValue("customerId", customer.id);
                clearErrors("customerId");
              }}
            />
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function CustomerSearch({ onPick }: { onPick: (customer: PickedCustomer) => void }) {
  const listId = useId();
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const search = useDebouncedValue(text.trim());

  const { data, isPending, isError, isFetching } = useCustomers({ search: search || undefined, limit: MAX_RESULTS });
  const results = data?.data ?? [];
  const more = (data?.meta.total ?? 0) - results.length;

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      if (results.length === 0) return;
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((i) => (i + step + results.length) % results.length);
    } else if (event.key === "Enter") {
      // Enter chooses a result here. It must never submit the whole sale.
      event.preventDefault();
      const customer = results[active];
      if (open && customer) onPick(customer);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && results[active] ? `${listId}-${active}` : undefined}
        aria-label="Search customers"
        autoComplete="off"
        className="pl-9"
        placeholder="Search by name, email or phone…"
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
      />

      {open && (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-sm border bg-popover shadow-md">
          <ul id={listId} role="listbox" aria-label="Customers" className="max-h-72 overflow-y-auto">
            {results.map((customer, i) => (
              <li
                key={customer.id}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                className={cn("cursor-pointer border-b p-3 last:border-b-0", i === active && "bg-muted")}
                onMouseEnter={() => setActive(i)}
                // Runs before the input's blur closes the list.
                onMouseDown={(event) => {
                  event.preventDefault();
                  onPick(customer);
                }}
              >
                <CustomerText customer={customer} />
              </li>
            ))}
          </ul>
          <p className="p-3 text-xs text-muted-foreground" aria-live="polite">
            {isError
              ? "We couldn't search customers. Please try again."
              : isPending || (isFetching && results.length === 0)
                ? "Searching…"
                : results.length === 0
                  ? search
                    ? `No customer matches "${search}". Choose "New customer" to add them.`
                    : "No customers yet. Choose \"New customer\" to add one."
                  : more > 0
                    ? `${more} more. Keep typing to narrow it down.`
                    : null}
          </p>
        </div>
      )}
    </div>
  );
}

function CustomerText({ customer }: { customer: PickedCustomer }) {
  return (
    <div className="min-w-0 text-sm">
      <p className="truncate font-medium">{customer.name ?? customer.email}</p>
      <p className="truncate text-xs text-muted-foreground">
        {customer.name && customer.email}
        {customer.name && customer.phone && " · "}
        {customer.phone}
      </p>
    </div>
  );
}
