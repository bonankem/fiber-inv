import { type z, zObject, zStr } from "../common";

export const authChangeReqZ = zObject("AuthChangeReqT", {
  token: zStr("Token for completing authentication"),
  password: zStr("The current password"),
  newPassword: zStr("The new password to set"),
});

export type AuthChangeReqT = z.infer<typeof authChangeReqZ>;
