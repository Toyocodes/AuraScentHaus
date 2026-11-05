import type { Metadata } from "next";
import { Suspense } from "react";
import { OtpForm, SignInVerify } from "@/components/auth";

export const metadata: Metadata = { title: "Enter your code" };

export default function VerifyPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-3 text-center">
        <p className="eyebrow text-gold">One more step</p>
        <h1 className="text-4xl">Check your email</h1>
      </div>
      <Suspense fallback={<OtpForm isPending />}>
        <SignInVerify />
      </Suspense>
    </div>
  );
}
