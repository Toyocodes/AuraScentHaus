"use client";

import { useEffect } from "react";
import { useGuestCart } from "@/store/guest-cart";

/**
 * Loads the guest cart from localStorage after the first render, so the server HTML
 * and the first client render match (no hydration warning).
 */
export function GuestCartHydrator() {
  useEffect(() => {
    void useGuestCart.persist.rehydrate();
  }, []);
  return null;
}
