import { getRoute } from "#/utils";

export const userApi = getRoute("/session/user", null, (req) => req.authUser);
