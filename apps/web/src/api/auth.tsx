import { createContext, use } from "react";
import type { Maybe } from "schema/utils";

export type AuthTokenHook = {
  value: string | null;
  update: (token: Maybe<string>) => void;
};

export const AuthContext = createContext<AuthTokenHook>({
  value: null,
  update: () => {},
});

export function useAuthToken() {
  return use(AuthContext);
}
