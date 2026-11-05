import type { Metadata } from "next";
import { OtpForm } from "@/components/auth";

export const metadata: Metadata = { title: "Enter your code" };

export default function VerifyPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-3 text-center">
        <p className="eyebrow text-gold">One more step</p>
        <h1 className="text-4xl">Check your email</h1>
      </div>
      {/* Not connected yet: `useVerifyCode()` + `useMergeCart()`, and `useRequestCode()` for resend */}
      <OtpForm email="ada@example.com" />
    </div>
  );
}
