import z from "zod";

export const loginReq = z.strictObject({
  email: z.email(),
  password: z.string(),
});

export type LoginReq = z.infer<typeof loginReq>;
