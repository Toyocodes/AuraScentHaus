"use client";

import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { GuestCartHydrator } from "./guest-cart-hydrator";
import { QueryProvider } from "./query-provider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      {children}
      <GuestCartHydrator />
      <Toaster position="top-center" richColors />
    </QueryProvider>
  );
}
