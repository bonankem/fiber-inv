import { MfaMode } from "../prisma";
import { z, zObject, zStr } from "../utils";
import { AuthStatus } from "./auth-status";

const { NONE, UNDECIDED, ...modes } = MfaMode;

export const authNeedsOtpZ = zObject("AuthNeedsOtpT", {
  status: z.literal(AuthStatus.NEEDS_OTP).describe("User needs to provide OTP"),
  userId: zStr("The UUID of the user being authenticated"),
  token: zStr("Token for completing authentication"),
  mode: z.enum(modes).describe("How the OTP was sent"),
});

export type AuthNeedsOtpT = z.infer<typeof authNeedsOtpZ>;
