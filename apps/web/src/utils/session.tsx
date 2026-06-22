import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { userFullZ } from "schema/people";
import { useAuthToken } from "#/api/auth";
import { isApiError, showAppError, useApiGet } from "#/api/helpers";

export function useSessionCheck() {
  const token = useAuthToken();
  const authUser = useApiGet("auth/user", userFullZ);
  const navigate = useNavigate();
  const qc = useQueryClient();

  useEffect(() => {
    if (!token.value) {
      navigate({ to: "/login" });
    } else if (isApiError(authUser.error, 401)) {
      showAppError(authUser.error);
      navigate({ to: "/login" });
      token.update(null);
      qc.clear();
    } else if (authUser.error) {
      console.error(authUser.error);
    }
  }, [token, authUser.error, navigate, qc]);

  return useMemo(
    () => ({
      token: token.value,
      user: authUser.data,
      loading: authUser.isPending,
      refetch: () => authUser.refetch(),
    }),
    [token.value, authUser],
  );
}
