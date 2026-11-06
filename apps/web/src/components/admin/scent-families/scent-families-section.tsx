"use client";

import { Plus } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog, EmptyState, PageHeader, QueryError } from "@/components/common";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  useAdminScentFamilies,
  useCreateScentFamily,
  useDeleteScentFamily,
  useUpdateScentFamily,
} from "@/hooks/admin/scent-families";
import { usePermission } from "@/hooks/auth";
import { toastAndRethrow } from "@/lib/toast-failure";
import { ScentFamilyDialog } from "./scent-family-form";

/** /admin/scent-families, connected: add, edit, deactivate and delete scent families. */
export function ScentFamiliesSection() {
  const { can } = usePermission();
  const families = useAdminScentFamilies();
  const createFamily = useCreateScentFamily();
  const updateFamily = useUpdateScentFamily();
  const deleteFamily = useDeleteScentFamily();
  const canEdit = can("categories:write");
  const canDelete = can("categories:delete");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalog"
        title="Scent families"
        description="What a product smells like, whatever kind of product it is. Shoppers can filter by these everywhere."
        actions={
          canEdit && (
            <ScentFamilyDialog
              trigger={
                <Button>
                  <Plus /> Add scent family
                </Button>
              }
              isPending={createFamily.isPending}
              onSubmit={async (input) => {
                await createFamily.mutateAsync(input).catch(toastAndRethrow("We couldn't add this scent family."));
                toast.success(`${input.name} added.`);
              }}
            />
          )
        }
      />
      {families.isPending ? (
        <Skeleton className="h-96" />
      ) : families.isError ? (
        <QueryError error={families.error} onRetry={() => void families.refetch()} />
      ) : families.data.length === 0 ? (
        <EmptyState title="No scent families yet" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Scent family</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {families.data.map((f) => (
              <TableRow key={f.id} className={f.isActive ? undefined : "opacity-60"}>
                <TableCell>
                  <p className="font-medium">{f.name}</p>
                  {f.description && <p className="max-w-md truncate text-xs text-muted-foreground">{f.description}</p>}
                </TableCell>
                <TableCell className="tabular-nums">{f.productCount}</TableCell>
                <TableCell className="tabular-nums">{f.position}</TableCell>
                <TableCell>
                  <Badge variant={f.isActive ? "secondary" : "outline"}>{f.isActive ? "Active" : "Inactive"}</Badge>
                </TableCell>
                <TableCell className="space-x-1 text-right whitespace-nowrap">
                  {canEdit && (
                    <ScentFamilyDialog
                      trigger={
                        <Button size="xs" variant="outline">
                          Edit
                        </Button>
                      }
                      family={f}
                      isPending={updateFamily.isPending}
                      onSubmit={async (input) => {
                        await updateFamily
                          .mutateAsync({ familyId: f.id, input })
                          .catch(toastAndRethrow("We couldn't save this scent family."));
                        toast.success("Scent family saved.");
                      }}
                    />
                  )}
                  {canDelete && (
                    <ConfirmDialog
                      trigger={
                        <Button size="xs" variant="ghost">
                          Delete
                        </Button>
                      }
                      title={`Delete ${f.name}?`}
                      description={
                        f.productCount > 0
                          ? `${f.productCount} products use it, so it can't be deleted yet. Remove it from them first, or edit it and untick Active to hide it.`
                          : "This can't be undone."
                      }
                      confirmLabel="Delete scent family"
                      destructive
                      isPending={deleteFamily.isPending}
                      onConfirm={async () => {
                        await deleteFamily.mutateAsync(f.id).catch(toastAndRethrow("We couldn't delete this scent family."));
                        toast.success("Scent family deleted.");
                      }}
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
