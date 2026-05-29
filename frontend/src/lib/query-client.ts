import { QueryClient } from "@tanstack/react-query";

import { getErrorMessage } from "lib/api/errors";

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        onError: (error) => {
          if (process.env.NODE_ENV === "development") {
            console.error("[mutation]", getErrorMessage(error));
          }
        },
      },
    },
  });
}
