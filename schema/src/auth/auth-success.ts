import { userFullZ } from "../people";
import { z, zObject, zStr } from "../utils";
import { AuthStatus } from "./auth-status";

export const authSuccessZ = zObject("AuthSuccessT", {
  status: z.literal(AuthStatus.SUCCESS),
  user: userFullZ.describe("The authenticated user"),
  token: zStr("Access token"),
  refresh: zStr("Refresh token"),
});

export type AuthSuccessT = z.infer<typeof authSuccessZ>;
