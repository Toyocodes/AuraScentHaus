"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * False on the server and during hydration, true straight after.
 *
 * Parts of a page inside <Suspense> hydrate later than the rest. By then the navbar may already
 * have loaded shared data (the user, categories, the guest bag), so they would render differently
 * from the server's HTML. Anything using shared data in those parts should wait for this.
 */
export function useHasMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
