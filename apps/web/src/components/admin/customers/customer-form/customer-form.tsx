"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { AdminCreateCustomerInput } from "@aurascenthaus/shared";
import { FormInput, SubmitButton, quietly } from "@/components/form";
import { Form } from "@/components/ui/form";
import { customerFormSchema, EMPTY_CUSTOMER, toCustomerInput, type CustomerFormValues } from "./customer-schema";

interface CustomerFormProps {
  defaultValues?: CustomerFormValues;
  submitLabel?: string;
  isPending?: boolean;
  /** Wire to `useCreateCustomer().mutateAsync` or `useUpdateCustomer()`. */
  onSubmit?: (input: AdminCreateCustomerInput) => void | Promise<void>;
}

export function CustomerForm({
  defaultValues = EMPTY_CUSTOMER,
  submitLabel = "Add customer",
  isPending,
  onSubmit,
}: CustomerFormProps) {
  const form = useForm({ resolver: zodResolver(customerFormSchema), defaultValues });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(quietly((values: CustomerFormValues) => onSubmit?.(toCustomerInput(values))))} className="space-y-4" noValidate>
        <FormInput<CustomerFormValues>
          name="email"
          label="Email"
          type="email"
          autoComplete="off"
          description="They can sign in with this email later to see their orders."
        />
        <FormInput<CustomerFormValues> name="name" label="Full name" autoComplete="off" />
        <FormInput<CustomerFormValues> name="phone" label="Phone (optional)" type="tel" autoComplete="off" />
        <SubmitButton className="w-full" isPending={isPending}>
          {submitLabel}
        </SubmitButton>
      </form>
    </Form>
  );
}
