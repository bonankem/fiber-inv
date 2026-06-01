import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import AuthProvider from "./AuthProvider";

const queryClient = new QueryClient();

export default function ApiProvider(props: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{props.children}</AuthProvider>
    </QueryClientProvider>
  );
}
