import { type z, zObject, zStr } from "../common";

export const authLoginReqZ = zObject("AuthLoginReqT", {
  email: zStr("Email address"),
  password: zStr("Accont password"),
});

export type AuthLoginReqT = z.infer<typeof authLoginReqZ>;
