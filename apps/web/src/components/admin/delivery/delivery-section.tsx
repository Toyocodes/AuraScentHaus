"use client";

import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { DeliveryZoneDTO, DeliveryZoneInput } from "@aurascenthaus/shared";
import { ConfirmDialog, EmptyState, PageHeader, QueryError } from "@/components/common";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  useAdminDeliveryZones,
  useCreateDeliveryZone,
  useDeleteDeliveryZone,
  useUpdateDeliveryZone,
} from "@/hooks/admin/delivery";
import { usePermission } from "@/hooks/auth";
import { formatNaira } from "@/lib/format";
import { toastAndRethrow } from "@/lib/toast-failure";
import { DeliveryZoneDialog } from "./delivery-zone-dialog";

/** /admin/delivery, connected: Lagos axes with their areas, and the other delivery options, with fees. */
export function DeliverySection() {
  const { can } = usePermission();
  const zones = useAdminDeliveryZones();
  const createZone = useCreateDeliveryZone();
  const updateZone = useUpdateDeliveryZone();
  const deleteZone = useDeleteDeliveryZone();
  const canEdit = can("delivery:write");

  const save = (zone: DeliveryZoneDTO) => async (input: DeliveryZoneInput) => {
    await updateZone.mutateAsync({ zoneId: zone.id, input }).catch(toastAndRethrow("We couldn't save this delivery option."));
    toast.success(`${input.name} saved.`);
  };

  const editButton = (zone: DeliveryZoneDTO) =>
    canEdit && (
      <DeliveryZoneDialog
        trigger={
          <Button size="xs" variant="outline">
            Edit
          </Button>
        }
        zone={zone}
        isPending={updateZone.isPending}
        onSubmit={save(zone)}
      />
    );

  const status = (zone: DeliveryZoneDTO) => (
    <Badge variant={zone.isActive ? "secondary" : "outline"}>{zone.isActive ? "Active" : "Inactive"}</Badge>
  );

  const axes = zones.data?.filter((z) => z.kind === "LAGOS_AXIS") ?? [];
  const others = zones.data?.filter((z) => z.kind !== "LAGOS_AXIS") ?? [];

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Store"
        title="Delivery"
        description="The delivery options customers pick from at checkout, with their fees. If a customer picks the wrong one, call them to settle the difference before sending the order. Changing a fee only affects new orders."
        actions={
          canEdit && (
            <DeliveryZoneDialog
              trigger={
                <Button>
                  <Plus /> Add Lagos axis
                </Button>
              }
              isPending={createZone.isPending}
              onSubmit={async (input) => {
                await createZone.mutateAsync(input).catch(toastAndRethrow("We couldn't add this axis."));
                toast.success(`${input.name} added.`);
              }}
            />
          )
        }
      />

      {zones.isPending ? (
        <Skeleton className="h-96" />
      ) : zones.isError ? (
        <QueryError error={zones.error} onRetry={() => void zones.refetch()} />
      ) : (
        <>
          <section className="space-y-3">
            <h2 className="text-2xl">Lagos axes</h2>
            {axes.length === 0 ? (
              <EmptyState title="No Lagos axes yet" description="Lagos customers can only pick Other Lagos area." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Axis</TableHead>
                    <TableHead>Areas</TableHead>
                    <TableHead>Fee</TableHead>
                    <TableHead>Delivery time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {axes.map((z) => (
                    <TableRow key={z.id} className={z.isActive ? undefined : "opacity-60"}>
                      <TableCell className="font-medium whitespace-nowrap">{z.name}</TableCell>
                      <TableCell>
                        <ul className="flex max-w-md flex-wrap gap-1">
                          {z.areas.map((area) => (
                            <li key={area}>
                              <Badge variant="outline">{area}</Badge>
                            </li>
                          ))}
                        </ul>
                      </TableCell>
                      <TableCell className="tabular-nums whitespace-nowrap">{formatNaira(z.fee)}</TableCell>
                      <TableCell className="text-muted-foreground">{z.deliveryTime ?? "—"}</TableCell>
                      <TableCell>{status(z)}</TableCell>
                      <TableCell className="space-x-1 text-right whitespace-nowrap">
                        {editButton(z)}
                        {canEdit && (
                          <ConfirmDialog
                            trigger={
                              <Button size="xs" variant="ghost">
                                Delete
                              </Button>
                            }
                            title={`Delete ${z.name}?`}
                            description={`Customers in ${z.areas.join(", ")} will need to pick another option, so add these areas to another axis first if you still deliver there. Past orders keep the fee they paid.`}
                            confirmLabel="Delete axis"
                            destructive
                            isPending={deleteZone.isPending}
                            onConfirm={async () => {
                              await deleteZone.mutateAsync(z.id).catch(toastAndRethrow("We couldn't delete this axis."));
                              toast.success(`${z.name} deleted.`);
                            }}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </section>

          <section className="space-y-3">
            <div className="space-y-1">
              <h2 className="text-2xl">Other options</h2>
              <p className="text-sm text-muted-foreground">
                These can be edited or switched off, but not deleted.
              </p>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Option</TableHead>
                  <TableHead>Applies to</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {others.map((z) => (
                  <TableRow key={z.id} className={z.isActive ? undefined : "opacity-60"}>
                    <TableCell className="font-medium whitespace-nowrap">{z.name}</TableCell>
                    <TableCell className="text-muted-foreground">{APPLIES_TO[z.kind]}</TableCell>
                    <TableCell className="tabular-nums whitespace-nowrap">{formatNaira(z.fee)}</TableCell>
                    <TableCell className="text-muted-foreground">{z.deliveryTime ?? "—"}</TableCell>
                    <TableCell>{status(z)}</TableCell>
                    <TableCell className="text-right whitespace-nowrap">{editButton(z)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>
        </>
      )}
    </div>
  );
}

const APPLIES_TO: Record<DeliveryZoneDTO["kind"], string> = {
  LAGOS_AXIS: "",
  LAGOS_OTHER: "Parts of Lagos not listed above",
  NIGERIA: "Every state except Lagos",
  PICKUP: "Customers who collect from the store",
};
