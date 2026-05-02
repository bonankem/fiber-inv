import { z } from "../common";
import { authNeedsChangeZ } from "./auth-needs-change";
import { authNeedsInstallZ } from "./auth-needs-install";
import { authNeedsMfaModeZ } from "./auth-needs-mfa-mode";
import { authNeedsOtpZ } from "./auth-needs-otp";
import { authSuccessZ } from "./auth-success";

export const authResultZ = z
  .discriminatedUnion("status", [
    authNeedsChangeZ,
    authNeedsMfaModeZ,
    authNeedsInstallZ,
    authNeedsOtpZ,
    authSuccessZ,
  ])
  .describe("Result of an authentication request");

export type AuthResultT = z.infer<typeof authResultZ>;
