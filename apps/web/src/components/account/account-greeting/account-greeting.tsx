"use client";

import { useMe } from "@/hooks/auth";

/** "My account" heading with the signed-in customer's first name. */
export function AccountGreeting() {
  const { data: user } = useMe();
  const firstName = user?.name?.split(" ")[0];

  return (
    <div className="space-y-2">
      <p className="eyebrow text-gold">My account</p>
      <p className="font-heading text-3xl">{firstName ? `Hello, ${firstName}` : "Welcome"}</p>
    </div>
  );
}
