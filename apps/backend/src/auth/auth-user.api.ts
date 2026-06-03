import { getRoute } from "#/utils";
import { Allow } from "./guard";

export default getRoute("/auth/user", null, (req) => req.authUser, Allow.USER);
