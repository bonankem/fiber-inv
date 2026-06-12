import { z, zObject, zStr } from "../utils";
import { AuthStatus } from "./auth-status";

export const authNeedsChangeZ = zObject("AuthNeedsChangeT", {
  status: z
    .literal(AuthStatus.NEEDS_CHANGE)
    .describe("Password needs to be changed"),
  token: zStr("Token for completing authentication"),
  userId: zStr("The UUID of the user being authenticated"),
  isAdmin: z.boolean("Is this user an admin?"),
  email: z.string(),
  name: z.string(),
});

export type AuthNeedsChangeT = z.infer<typeof authNeedsChangeZ>;
