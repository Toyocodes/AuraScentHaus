import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { getErrorStatus } from "@/hooks/helper/errors";
import { queryKeys } from "@/hooks/helper/query-keys";

/** App-wide TanStack Query defaults. */
export function makeQueryClient() {
  /**
   * Any 401 means the session has ended (expired, or signed out on another device).
   * Marking "me" as signed out lets the navbar update and <RequireAuth> send the visitor to /login.
   */
  const onError = (error: unknown) => {
    if (getErrorStatus(error) === 401) queryClient.setQueryData(queryKeys.auth.me(), null);
  };

  const queryClient: QueryClient = new QueryClient({
    queryCache: new QueryCache({ onError }),
    mutationCache: new MutationCache({ onError }),
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

  return queryClient;
}
