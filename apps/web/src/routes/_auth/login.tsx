import { createFileRoute } from "@tanstack/react-router";
import LoginPage from "#/modules/auth/LoginPage";

export const Route = createFileRoute("/_auth/login")({
  component: LoginPage,
});
