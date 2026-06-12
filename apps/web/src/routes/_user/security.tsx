import { createFileRoute } from "@tanstack/react-router";
import SecurityPage from "#/modules/staff/SecurityPage";

export const Route = createFileRoute("/_user/security")({
  component: SecurityPage,
});
