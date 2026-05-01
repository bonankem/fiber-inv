import { createFileRoute } from "@tanstack/react-router";
import StaffPage from "#/modules/staff/StaffPage";

export const Route = createFileRoute("/_user/staff")({
  component: StaffPage,
});
