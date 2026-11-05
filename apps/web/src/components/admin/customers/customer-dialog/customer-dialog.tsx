"use client";

import { useState, type ReactNode } from "react";
import type { AdminCreateCustomerInput, UserDTO } from "@aurascenthaus/shared";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CustomerForm } from "../customer-form/customer-form";
import { toCustomerFormValues } from "../customer-form/customer-schema";

interface CustomerDialogProps {
  trigger: ReactNode;
  /** Leave out to add a new customer. */
  customer?: Pick<UserDTO, "email" | "name" | "phone">;
  isPending?: boolean;
  onSubmit?: (input: AdminCreateCustomerInput) => void | Promise<void>;
}

/** "Add customer" / "Edit customer" pop-up. Closes after a successful save. */
export function CustomerDialog({ trigger, customer, isPending, onSubmit }: CustomerDialogProps) {
  const [open, setOpen] = useState(false);
  const editing = Boolean(customer);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">{editing ? "Edit customer" : "Add a customer"}</DialogTitle>
          <DialogDescription>
            {editing ? "Update their contact details." : "For customers who shop in person or order by phone."}
          </DialogDescription>
        </DialogHeader>
        <CustomerForm
          key={String(open)}
          defaultValues={customer ? toCustomerFormValues(customer) : undefined}
          submitLabel={editing ? "Save changes" : "Add customer"}
          isPending={isPending}
          onSubmit={async (input) => {
            await onSubmit?.(input);
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
