import { getRoute } from "#/utils";

export default getRoute("/session/user", null, (req) => req.authUser);
