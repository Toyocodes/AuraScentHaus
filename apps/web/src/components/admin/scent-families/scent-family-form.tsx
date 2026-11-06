"use client";

import { useState, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { ScentFamilyDTO, ScentFamilyInput } from "@aurascenthaus/shared";
import { FormCheckbox, FormInput, FormTextarea, quietly, SubmitButton } from "@/components/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";

const schema = z.object({
  name: z.string().trim().min(1, "Enter a name").max(60),
  description: z.string().trim().max(500),
  position: z.coerce.number<string | number>().int("Whole numbers only").min(0, "Can't be negative").max(9999),
  isActive: z.boolean(),
});
type Values = z.input<typeof schema>;

function ScentFamilyForm({
  family,
  isPending,
  onSubmit,
}: {
  family?: ScentFamilyDTO;
  isPending?: boolean;
  onSubmit?: (input: ScentFamilyInput) => void | Promise<void>;
}) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: family?.name ?? "",
      description: family?.description ?? "",
      position: String(family?.position ?? 0),
      isActive: family?.isActive ?? true,
    },
  });

  return (
    <Form {...form}>
      <form
        className="space-y-4"
        noValidate
        onSubmit={form.handleSubmit((v) =>
          quietly(() =>
            onSubmit?.({ name: v.name, description: v.description || null, position: v.position, isActive: v.isActive }),
          )(undefined),
        )}
      >
        <FormInput<Values> name="name" label="Name" placeholder="e.g. Oud" />
        <FormTextarea<Values> name="description" label="Description (optional)" rows={3} maxLength={500} />
        <FormInput<Values> name="position" label="Display order" type="number" min={0} description="Lower numbers come first." />
        <FormCheckbox<Values> name="isActive" label="Active" description="Inactive families are hidden from shoppers." />
        <SubmitButton className="w-full" isPending={isPending}>
          {family ? "Save changes" : "Add scent family"}
        </SubmitButton>
      </form>
    </Form>
  );
}

interface ScentFamilyDialogProps {
  trigger: ReactNode;
  /** Leave out to add a new family. */
  family?: ScentFamilyDTO;
  isPending?: boolean;
  onSubmit?: (input: ScentFamilyInput) => void | Promise<void>;
}

/** Add or edit a scent family in a pop-up. Closes after a successful save. */
export function ScentFamilyDialog({ trigger, family, isPending, onSubmit }: ScentFamilyDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">{family ? `Edit ${family.name}` : "Add a scent family"}</DialogTitle>
          <DialogDescription>What a product smells like. A product can belong to several families.</DialogDescription>
        </DialogHeader>
        <ScentFamilyForm
          key={String(open)}
          family={family}
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
