import type { z } from "../utils";
import { zFormObject, zStr } from "../utils";

export const authLoginReqZ = zFormObject("AuthLoginReqT", {
  email: zStr("Email address"),
  password: zStr("Accont password"),
});

export type AuthLoginReqT = z.infer<typeof authLoginReqZ>;
