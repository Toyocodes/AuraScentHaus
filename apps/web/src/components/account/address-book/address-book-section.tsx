"use client";

import { toast } from "sonner";
import { QueryError } from "@/components/common";
import { Skeleton } from "@/components/ui/skeleton";
import { useAddresses, useCreateAddress, useDeleteAddress, useUpdateAddress } from "@/hooks/addresses";
import { getErrorMessage } from "@/hooks/helper/errors";
import { AddressBook } from "./address-book";

/** /account/addresses, connected: add, delete and choose the default delivery address. */
export function AddressBookSection() {
  const addresses = useAddresses();
  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();
  const deleteAddress = useDeleteAddress();

  if (addresses.isPending) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    );
  }
  if (addresses.isError) return <QueryError error={addresses.error} onRetry={() => void addresses.refetch()} />;

  const fail = (fallback: string) => (error: unknown) => toast.error(getErrorMessage(error, fallback));

  return (
    <AddressBook
      addresses={addresses.data}
      isSaving={createAddress.isPending}
      onCreate={async (input) => {
        try {
          await createAddress.mutateAsync(input);
          toast.success("Address saved.");
        } catch (error) {
          fail("We couldn't save this address.")(error);
          throw error; // keeps the form open with what was typed
        }
      }}
      onMakeDefault={(addressId) =>
        updateAddress.mutate(
          { addressId, input: { isDefault: true } },
          { onSuccess: () => toast.success("Default address updated."), onError: fail("We couldn't update it.") },
        )
      }
      onDelete={(addressId) =>
        deleteAddress.mutate(addressId, {
          onSuccess: () => toast.success("Address deleted."),
          onError: fail("We couldn't delete it."),
        })
      }
    />
  );
}
