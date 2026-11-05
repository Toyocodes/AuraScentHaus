import { Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AttendantFieldProps {
  /** First name of the signed-in admin (new order), or whoever made the sale (edit). */
  name: string;
  editing?: boolean;
}

/**
 * Read-only on purpose: it isn't part of the form data. The API records the signed-in
 * admin itself, so this can't be changed or faked from the browser.
 */
export function AttendantField({ name, editing }: AttendantFieldProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor="attendant">Attended by</Label>
      <div className="relative">
        <Input id="attendant" value={name} readOnly disabled className="pr-9 font-medium" />
        <Lock className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">
        {editing
          ? "The person who made the sale. This stays the same when the order is edited."
          : "Filled in from your account and saved with the order. It can't be changed."}
      </p>
    </div>
  );
}
