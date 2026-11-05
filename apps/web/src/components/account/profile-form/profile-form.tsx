"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { UpdateProfileInput, UserDTO } from "@aurascenthaus/shared";
import { FormInput, SubmitButton } from "@/components/form";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { profileFormSchema, toProfileInput, type ProfileFormValues } from "./profile-schema";

interface ProfileFormProps {
  user?: Pick<UserDTO, "email" | "name" | "phone">;
  isPending?: boolean;
  /** Wire to `useUpdateProfile().mutateAsync`. */
  onSubmit?: (input: UpdateProfileInput) => void | Promise<void>;
}

export function ProfileForm({ user, isPending, onSubmit }: ProfileFormProps) {
  const form = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { name: user?.name ?? "", phone: user?.phone ?? "" },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (values) => onSubmit?.(toProfileInput(values)))}
        className="max-w-md space-y-4"
        noValidate
      >
        <div className="grid gap-2">
          <Label htmlFor="profile-email">Email</Label>
          <Input id="profile-email" value={user?.email ?? ""} disabled readOnly />
        </div>
        <FormInput<ProfileFormValues> name="name" label="Name" autoComplete="name" />
        <FormInput<ProfileFormValues> name="phone" label="Phone" type="tel" autoComplete="tel" />
        <SubmitButton isPending={isPending}>Save changes</SubmitButton>
      </form>
    </Form>
  );
}
