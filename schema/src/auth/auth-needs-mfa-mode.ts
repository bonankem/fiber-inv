import { z, zObject, zStr } from "../base";
import { AuthStatus } from "./auth-status";

export const authNeedsMfaModeZ = zObject("AuthNeedsMfaModeT", {
  status: z
    .literal(AuthStatus.NEEDS_MFA_MODE)
    .describe("User needs to choose an MFA mode"),
  token: zStr("Token for completing authentication"),
  userId: zStr("The UUID of the user being authenticated"),
});

export type AuthNeedsMfaModeT = z.infer<typeof authNeedsMfaModeZ>;
