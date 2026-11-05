import { QueryClient } from "@tanstack/react-query";
import { getErrorStatus } from "@/hooks/helper/errors";

/** App-wide TanStack Query defaults. */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
        refetchOnWindowFocus: false,
        // Retry network/5xx errors twice, but never 4xx (auth, validation, not found).
        retry: (failureCount, error) => {
          const status = getErrorStatus(error);
          if (status && status >= 400 && status < 500) return false;
          return failureCount < 2;
        },
      },
      mutations: {
        retry: false,
      },
    },
  });
}
