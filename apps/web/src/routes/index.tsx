import { createFileRoute, redirect } from "@tanstack/react-router";
import AuthProvider from "#/api/AuthProvider";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    const token = AuthProvider.fetchToken();
    const to = token ? "/ftth-surveys" : "/login";
    throw redirect({ to, replace: true });
  },
});
