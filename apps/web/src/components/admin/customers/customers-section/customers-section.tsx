"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Pagination, QueryError, SearchForm } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCreateCustomer, useCustomers, useUpdateCustomer } from "@/hooks/admin/customers";
import { usePermission } from "@/hooks/auth";
import { toastAndRethrow } from "@/lib/toast-failure";
import { CustomerDialog } from "../customer-dialog/customer-dialog";
import { CustomersTable } from "../customers-table/customers-table";

const PAGE_SIZE = 20;

/** /admin/customers, connected: search, add and edit customers. */
export function CustomersSection() {
  const { can } = usePermission();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const customers = useCustomers({ search: search || undefined, page, limit: PAGE_SIZE });
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const canWrite = can("customers:write");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="People"
        title="Customers"
        actions={
          canWrite && (
            <CustomerDialog
              trigger={
                <Button>
                  <UserPlus /> Add customer
                </Button>
              }
              isPending={createCustomer.isPending}
              onSubmit={async (input) => {
                await createCustomer.mutateAsync(input).catch(toastAndRethrow("We couldn't add this customer."));
                toast.success("Customer added.");
              }}
            />
          )
        }
      />
      <SearchForm
        placeholder="Search by name, email or phone…"
        className="max-w-sm"
        onSearch={(text) => {
          setSearch(text);
          setPage(1);
        }}
      />
      {customers.isPending ? (
        <Skeleton className="h-64" />
      ) : customers.isError ? (
        <QueryError error={customers.error} onRetry={() => void customers.refetch()} />
      ) : (
        <>
          <CustomersTable
            customers={customers.data.data}
            canEdit={canWrite}
            isSaving={updateCustomer.isPending}
            onUpdate={async (customerId, input) => {
              await updateCustomer
                .mutateAsync({ customerId, input })
                .catch(toastAndRethrow("We couldn't save this customer."));
              toast.success("Customer saved.");
            }}
          />
          <Pagination page={customers.data.meta.page} totalPages={customers.data.meta.totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
