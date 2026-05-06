import { type z, zStr } from "../common";
import { zFormObject } from "../utils";

export const authLoginReqZ = zFormObject("AuthLoginReqT", {
  email: zStr("Email address"),
  password: zStr("Accont password"),
});

export type AuthLoginReqT = z.infer<typeof authLoginReqZ>;
