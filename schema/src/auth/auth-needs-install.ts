import { z, zObject, zStr } from "../base";
import { AuthStatus } from "./auth-status";

export const authNeedsInstallZ = zObject("AuthNeedsInstallT", {
  status: z
    .literal(AuthStatus.NEEDS_INSTALL)
    .describe("Authenticator needs to be installed"),
  token: zStr("Token for completing authentication"),
  userId: zStr("The UUID of the user being authenticated"),
  secret: zStr("TOTP secret"),
  otpUri: zStr("The otpauth:// URI"),
});

export type AuthNeedsInstallT = z.infer<typeof authNeedsInstallZ>;
