import type { ReactNode } from "react";
import type { AddressDTO, ShippingAddressDTO } from "@aurascenthaus/shared";
import { Badge } from "@/components/ui/badge";

interface AddressCardProps {
  address: AddressDTO | ShippingAddressDTO;
  /** Buttons under the address (Make default, Delete…). */
  actions?: ReactNode;
}

export function AddressText({ address }: { address: AddressDTO | ShippingAddressDTO }) {
  return (
    <>
      <p className="font-medium">{address.fullName}</p>
      <p className="text-muted-foreground">
        {address.line1}
        {address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state}
      </p>
      <p className="text-muted-foreground">{address.phone}</p>
    </>
  );
}

export function AddressCard({ address, actions }: AddressCardProps) {
  const isDefault = "isDefault" in address && address.isDefault;
  return (
    <div className="space-y-1 rounded-sm border bg-card p-4 text-sm">
      {isDefault && (
        <Badge variant="secondary" className="float-right">
          Default
        </Badge>
      )}
      <AddressText address={address} />
      {actions && <div className="flex gap-2 pt-2">{actions}</div>}
    </div>
  );
}
