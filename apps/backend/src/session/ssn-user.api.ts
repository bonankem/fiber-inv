import { getRoute } from "#/utils/routing";

export const userApi = getRoute({
  url: "/session/user",
  handler: (req) => req.authUser,
});
