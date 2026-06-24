import { createFileRoute } from "@tanstack/react-router";
import ForgotPage from "#/modules/auth/ForgotPage";

export const Route = createFileRoute("/_auth/forgot")({
  component: ForgotPage,
});
