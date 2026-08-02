import { MfaMode } from "#/db";
import { z, zObject } from "../utils";

export const sessionPasswordReqZ = zObject("SessionPasswordReqT", {
  oldPassword: z.string(),
  newPassword: z.string(),
  otp: z.string().optional(),
});

export const sessionPasswordResZ = zObject("SessionPasswordResT", {
  needsOtp: z.enum(MfaMode),
});

export type SessionPasswordReqT = z.infer<typeof sessionPasswordReqZ>;

export type SessionPasswordResT = z.infer<typeof sessionPasswordResZ>;
