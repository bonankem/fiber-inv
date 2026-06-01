import { type PropsWithChildren, useState } from "react";
import type { Maybe } from "schema/utils";
import { AuthContext } from "#/api/auth";

const AUTH_KEY = "servicex.auth";

const fetchToken = () => localStorage.getItem(AUTH_KEY);
const clearToken = () => localStorage.removeItem(AUTH_KEY);
const storeToken = (t: string) => localStorage.setItem(AUTH_KEY, t);

export default function AuthProvider(props: PropsWithChildren) {
  const [value, setValue] = useState(() => fetchToken());

  const update = (t: Maybe<string>) => {
    setValue(t || null);
    if (t) storeToken(t);
    else clearToken();
  };

  return <AuthContext value={{ value, update }}>{props.children}</AuthContext>;
}

AuthProvider.fetchToken = fetchToken;
