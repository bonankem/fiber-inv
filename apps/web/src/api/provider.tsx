import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import AuthProvider from "./AuthProvider";
import { isApiError } from "./helpers";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: (n, e) => n < 3 && !isApiError(e),
    },
  },
});

export default function ApiProvider(props: PropsWithChildren) {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    </AuthProvider>
  );
}
