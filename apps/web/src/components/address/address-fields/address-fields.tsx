"use client";

import type { FieldValues } from "react-hook-form";
import { FormInput } from "@/components/form";

const FIELDS = [
  { name: "fullName", label: "Full name", autoComplete: "name", wide: true },
  { name: "phone", label: "Phone", autoComplete: "tel", type: "tel", wide: true },
  { name: "line1", label: "Address", autoComplete: "address-line1", wide: true },
  { name: "line2", label: "Apartment, landmark (optional)", autoComplete: "address-line2", wide: true },
  { name: "city", label: "City", autoComplete: "address-level2" },
  { name: "state", label: "State", autoComplete: "address-level1" },
] as const;

/**
 * Address inputs for any <Form>. Use `prefix` when the address is nested
 * (checkout uses `prefix="address"`, so the fields are `address.city` etc.).
 */
export function AddressFields({ prefix }: { prefix?: string }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {FIELDS.map((f) => (
        <FormInput<FieldValues>
          key={f.name}
          name={prefix ? `${prefix}.${f.name}` : f.name}
          label={f.label}
          autoComplete={f.autoComplete}
          type={"type" in f ? f.type : "text"}
          itemClassName={"wide" in f ? "col-span-2" : undefined}
        />
      ))}
    </div>
  );
}
