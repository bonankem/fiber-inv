import { type z, zObject, zStr } from "../utils";

export const authResetReqZ = zObject("AuthResetReqT", {
  code: zStr("The reset code"),
  newPassword: zStr("The new password"),
});

export type AuthResetReqT = z.infer<typeof authResetReqZ>;
