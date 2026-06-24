import { createFileRoute } from "@tanstack/react-router";
import SecurityPage from "#/modules/admin/SecurityPage";

export const Route = createFileRoute("/_user/security")({
  component: SecurityPage,
});
