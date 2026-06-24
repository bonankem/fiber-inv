import { type z, zFormObject, zStr, zStrOpt } from "../utils";

export const authForgotReqZ = zFormObject("AuthForgotReqT", {
  email: zStr("The email for which password reset is needed"),
  turnstile: zStrOpt("The Turnstile token"),
});

export type AuthForgotReqT = z.infer<typeof authForgotReqZ>;
