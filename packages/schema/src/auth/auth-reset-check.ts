import { z, zObject } from "../utils";

export const authResetCheckReqZ = zObject("AuthResetCheckReqT", {
  code: z.string(),
});

export type AuthResetCheckReqT = z.infer<typeof authResetCheckReqZ>;

export const authResetCheckResZ = zObject("AuthResetCheckResT", {
  valid: z.boolean(),
  name: z.string(),
  email: z.string(),
  isAdmin: z.boolean(),
});

export type AuthResetCheckResT = z.infer<typeof authResetCheckResZ>;
