import { z, zObject, zStr } from "../common";
import { AuthStatus } from "./auth-status";

export const authNeedsChangeZ = zObject("AuthNeedsChangeT", {
  status: z
    .literal(AuthStatus.NEEDS_CHANGE)
    .describe("Password needs to be changed"),
  token: zStr("Token for completing authentication"),
  userId: zStr("The UUID of the user being authenticated"),
});

export type AuthNeedsChangeT = z.infer<typeof authNeedsChangeZ>;
