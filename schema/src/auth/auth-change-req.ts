import type { z } from "../utils";
import { zFormObject, zStr } from "../utils";

export const authChangeReqZ = zFormObject("AuthChangeReqT", {
  token: zStr("Token for completing authentication"),
  password: zStr("The current password"),
  newPassword: zStr("The new password to set"),
});

export type AuthChangeReqT = z.infer<typeof authChangeReqZ>;
