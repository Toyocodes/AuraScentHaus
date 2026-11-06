"use client";

import { useState } from "react";
import type { AddressDTO, AddressInput } from "@aurascenthaus/shared";
import { AddressCard } from "@/components/address";
import { ConfirmDialog, EmptyState } from "@/components/common";
import { Button } from "@/components/ui/button";
import { AddressForm } from "./address-form";

interface AddressBookProps {
  addresses: AddressDTO[];
  isSaving?: boolean;
  /** Wire to `useCreateAddress().mutateAsync`. */
  onCreate?: (input: AddressInput) => void | Promise<void>;
  /** Wire to `useUpdateAddress().mutate({ addressId, input: { isDefault: true } })`. */
  onMakeDefault?: (addressId: string) => void;
  /** Wire to `useDeleteAddress().mutate(addressId)`. */
  onDelete?: (addressId: string) => void;
}

export function AddressBook({ addresses, isSaving, onCreate, onMakeDefault, onDelete }: AddressBookProps) {
  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-6">
      {addresses.length === 0 && !adding && (
        <EmptyState title="No saved addresses" description="Save an address to check out faster." className="py-8" />
      )}

      <ul className="grid gap-3 sm:grid-cols-2">
        {addresses.map((a) => (
          <li key={a.id}>
            <AddressCard
              address={a}
              actions={
                <>
                  {!a.isDefault && (
                    <Button size="xs" variant="outline" onClick={() => onMakeDefault?.(a.id)}>
                      Make default
                    </Button>
                  )}
                  <ConfirmDialog
                    trigger={
                      <Button size="xs" variant="ghost">
                        Delete
                      </Button>
                    }
                    title="Delete this address?"
                    confirmLabel="Delete"
                    destructive
                    onConfirm={() => onDelete?.(a.id)}
                  />
                </>
              }
            />
          </li>
        ))}
      </ul>

      {adding ? (
        <AddressForm
          isPending={isSaving}
          onCancel={() => setAdding(false)}
          onSubmit={async (input) => {
            try {
              await onCreate?.(input);
              setAdding(false);
            } catch {
              // Keep the form open with what was typed; the caller shows the error.
            }
          }}
        />
      ) : (
        <Button variant="outline" onClick={() => setAdding(true)}>
          + Add address
        </Button>
      )}
    </div>
  );
}
