"use client";

import { useState, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { koboToNaira, nairaToKobo, type DeliveryZoneDTO, type DeliveryZoneInput } from "@aurascenthaus/shared";
import { FormCheckbox, FormInput, FormTagsInput, quietly, SubmitButton } from "@/components/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";

const schema = z.object({
  name: z.string().trim().min(1, "Enter a name").max(80),
  areas: z.array(z.string().trim().min(1).max(100)).max(100),
  fee: z.coerce.number<string | number>().min(0, "Can't be negative").max(10_000_000, "That's too high"),
  deliveryTime: z.string().trim().max(80),
  position: z.coerce.number<string | number>().int("Whole numbers only").min(0, "Can't be negative").max(9999),
  isActive: z.boolean(),
});
type Values = z.input<typeof schema>;

const KIND_HELP: Record<DeliveryZoneDTO["kind"], string> = {
  LAGOS_AXIS: "A part of Lagos and the areas in it. Customers see the areas at checkout and pick the axis their address is in.",
  LAGOS_OTHER: "Customers pick this when their part of Lagos isn't listed under any axis.",
  NIGERIA: "Customers pick this for an address in any state outside Lagos.",
  PICKUP: "The customer collects the order from your store.",
};

function DeliveryZoneForm({
  zone,
  isPending,
  onSubmit,
}: {
  zone?: DeliveryZoneDTO;
  isPending?: boolean;
  onSubmit?: (input: DeliveryZoneInput) => void | Promise<void>;
}) {
  const isAxis = !zone || zone.kind === "LAGOS_AXIS";
  const form = useForm({
    resolver: zodResolver(
      // An axis needs at least one area, or nobody could ever be charged its fee.
      isAxis ? schema.extend({ areas: schema.shape.areas.min(1, "Add at least one area") }) : schema,
    ),
    defaultValues: {
      name: zone?.name ?? "",
      areas: zone?.areas ?? [],
      fee: zone ? String(koboToNaira(zone.fee)) : "",
      deliveryTime: zone?.deliveryTime ?? (isAxis ? "1 to 2 working days" : ""),
      position: String(zone?.position ?? 0),
      isActive: zone?.isActive ?? true,
    },
  });

  return (
    <Form {...form}>
      <form
        className="space-y-4"
        noValidate
        onSubmit={form.handleSubmit((v) =>
          quietly(() =>
            onSubmit?.({
              name: v.name,
              ...(isAxis && { areas: v.areas }),
              fee: nairaToKobo(v.fee),
              deliveryTime: v.deliveryTime || null,
              position: v.position,
              isActive: v.isActive,
            }),
          )(undefined),
        )}
      >
        <FormInput<Values> name="name" label="Name" placeholder="e.g. Ikeja Axis" />
        {isAxis && (
          <FormTagsInput<Values>
            name="areas"
            label="Areas"
            placeholder="Type an area, then press Enter"
            description="Shown under the axis at checkout so customers can find their area. An area can only be in one axis."
          />
        )}
        <div className="grid grid-cols-2 gap-4">
          <FormInput<Values> name="fee" label="Fee (₦)" type="number" min={0} step="any" placeholder="3000" />
          <FormInput<Values> name="position" label="Display order" type="number" min={0} description="Lower comes first." />
        </div>
        <FormInput<Values>
          name="deliveryTime"
          label={zone?.kind === "PICKUP" ? "Ready in (optional)" : "Delivery time (optional)"}
          placeholder={zone?.kind === "PICKUP" ? "e.g. 1 working day" : "e.g. 1 to 2 working days"}
          description="Shown to customers at checkout and on their order."
        />
        <FormCheckbox<Values>
          name="isActive"
          label="Active"
          description={"Inactive options aren't offered at checkout."}
        />
        <SubmitButton className="w-full" isPending={isPending}>
          {zone ? "Save changes" : "Add axis"}
        </SubmitButton>
      </form>
    </Form>
  );
}

interface DeliveryZoneDialogProps {
  trigger: ReactNode;
  /** Leave out to add a new Lagos axis. */
  zone?: DeliveryZoneDTO;
  isPending?: boolean;
  onSubmit?: (input: DeliveryZoneInput) => void | Promise<void>;
}

/** Add a Lagos axis, or edit any delivery option, in a pop-up. Closes after a successful save. */
export function DeliveryZoneDialog({ trigger, zone, isPending, onSubmit }: DeliveryZoneDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">{zone ? `Edit ${zone.name}` : "Add a Lagos axis"}</DialogTitle>
          <DialogDescription>{KIND_HELP[zone?.kind ?? "LAGOS_AXIS"]}</DialogDescription>
        </DialogHeader>
        <DeliveryZoneForm
          key={String(open)}
          zone={zone}
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
