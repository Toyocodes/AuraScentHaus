"use client";

import { useFormContext, useWatch, type FieldValues } from "react-hook-form";
import { NIGERIAN_STATES } from "@aurascenthaus/shared";
import { FormInput, FormSelect } from "@/components/form";

const FIELDS = [
  { name: "fullName", label: "Full name", autoComplete: "name" },
  { name: "phone", label: "Phone", autoComplete: "tel", type: "tel" },
  { name: "line1", label: "Address", autoComplete: "address-line1" },
  { name: "line2", label: "Apartment, landmark (optional)", autoComplete: "address-line2" },
] as const;

const STATE_OPTIONS = NIGERIAN_STATES.map((s) => ({ value: s, label: s }));

/**
 * Address inputs for any <Form>. Use `prefix` when the address is nested
 * (checkout uses `prefix="address"`, so the fields are `address.city` etc.).
 * We deliver within Nigeria only, so the state is picked from a list. (The delivery fee comes
 * from the delivery area the customer picks at checkout, not from the address.)
 */
export function AddressFields({ prefix }: { prefix?: string }) {
  const path = (field: string) => (prefix ? `${prefix}.${field}` : field);
  const { control } = useFormContext<FieldValues>();
  const state = (useWatch({ control, name: path("state") }) as string | undefined) ?? "";
  // Older addresses were typed by hand: keep showing a state that is spelled differently from the list.
  const stateOptions =
    state && !STATE_OPTIONS.some((o) => o.value === state) ? [{ value: state, label: state }, ...STATE_OPTIONS] : STATE_OPTIONS;

  return (
    <div className="grid grid-cols-2 gap-4">
      {FIELDS.map((f) => (
        <FormInput<FieldValues>
          key={f.name}
          name={path(f.name)}
          label={f.label}
          autoComplete={f.autoComplete}
          type={"type" in f ? f.type : "text"}
          itemClassName="col-span-2"
        />
      ))}
      <FormInput<FieldValues> name={path("city")} label="City or town" autoComplete="address-level2" />
      <FormSelect<FieldValues> name={path("state")} label="State" options={stateOptions} placeholder="Choose a state" />
    </div>
  );
}
