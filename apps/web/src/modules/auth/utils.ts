import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { AuthResultT } from "schema/auth";
import { useAuthToken } from "#/api/auth";
import { useApiPost } from "#/api/helpers";

export type LoginFormProps<Extra = object> = Extra & {
  onResult?: (data: AuthResultT) => void;
  onCancel?: () => void;
};

export function useLogout() {
  const logout = useApiPost<void>("/session/logout");
  const client = useQueryClient();
  const token = useAuthToken();
  const navigate = useNavigate();
  const pending = logout.isPending;

  const call = async () => {
    if (pending) return;
    navigate({ to: "/login", replace: true });
    logout.mutateAsync().catch(() => {});
    client.clear();
    token.update(null);
  };

  return { call, pending };
}
