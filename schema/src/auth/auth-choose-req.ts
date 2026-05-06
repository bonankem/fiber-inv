import { MfaMode, z, zObject, zStr } from "../common";

const { NONE, UNDECIDED, ...modes } = MfaMode;

export const authChooseReqZ = zObject("AuthChooseReqT", {
  token: zStr("Token for completing authentication"),
  mode: z.enum(modes).describe("MFA mode to use"),
});

export type AuthChooseReqT = z.infer<typeof authChooseReqZ>;
