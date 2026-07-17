import { type BoxAddManyT, boxAddManyZ } from "schema/network";
import { postRoute } from "#/utils/routing";

export const netBoxesAddApi = postRoute({
  url: "/network/boxes",
  schema: boxAddManyZ,
  handler: (req) => netBoxesAdd(req.body),
});

const VALID_BOX = /^(\w{5,6})_X\d+(_H\d+(?:_([SE])\d+)?)?$/;

async function netBoxesAdd(dto: BoxAddManyT) {}
