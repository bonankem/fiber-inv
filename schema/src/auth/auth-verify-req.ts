import { MfaMode, z, zStr } from "../common";
import { zFormObject } from "../utils";

const { NONE, UNDECIDED, ...modes } = MfaMode;

export const authVerifyReqZ = zFormObject("AuthVerifyReqT", {
  token: zStr("Token for completing authentication"),
  mode: z.enum(modes).describe("The mode of OTP delivery"),
  otp: zStr("The OTP that was received"),
});

export type AuthVerifyReqT = z.infer<typeof authVerifyReqZ>;
