import type { Metadata } from "next";
import { EmailForm } from "@/components/auth";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-3 text-center">
        <p className="eyebrow text-gold">Welcome</p>
        <h1 className="text-4xl">Sign in or create an account</h1>
        <p className="text-sm text-muted-foreground">No password needed. We&apos;ll email you a one-time code.</p>
      </div>
      {/* Not connected yet: `useRequestCode()`, then go to /verify?email=… */}
      <EmailForm />
    </div>
  );
}
