import { indexBy } from "remeda";
import { bad, Err } from "schema/errors";
import {
  type FhcSubmitT,
  fhcCostCategoryOf,
  fhcImageTypes,
  fhcPbItemP,
  fhcSubmitZ,
  ftthConnectionS,
} from "schema/fhc";
import type { UserFullT } from "schema/people";
import { workFullP } from "schema/work";
import {
  FhcCostCategory,
  type Prisma,
  prisma,
  WorkAction,
  WorkStatus,
} from "#/db";
import { maybeConnect, maybeIdOrKey } from "#/utils/ids";
import { postRoute } from "#/utils/routing";
import { updateWork } from "#/utils/work";

export const fhcSubmitApi = postRoute({
  url: "/fhc/submit",
  schema: fhcSubmitZ,
  handler: (req) => fhcSubmit(req.body, req.authUser),
});
const db = prisma.ftthConnection;

async function fhcSubmit(dto: FhcSubmitT, from: UserFullT) {
  const { id: workId, fatId, fatPort, ontSerial } = dto;

  const fhc = await prisma.ftthConnection.findUnique({
    where: { id: workId },
    include: { work: workFullP },
  });
  console.log("TN", fhc?.tn);
  if (!fhc) bad(Err.NOT_FOUND);

  await mustNotExist(workId, "FAT port", { fatUniq: { fatId, fatPort } });
  await mustNotExist(workId, "ONT serial", { ontSerial });

  for (const key of fhcImageTypes) {
    if (dto.images[key]) continue;
    // FHC_POLE is only required if withPole === true
    if (key === "FHC_POLE" && !dto.withPole) continue;
    // fail if an image is omitted
    bad(Err.FIELD_REQUIRED, key);
  }

  const pbItems = await prisma.fhcPbItem.findMany(fhcPbItemP);
  const pbByRef = indexBy(pbItems, (item) => item.ref);

  const quantities = Object.entries(dto.quantities ?? {})
    .map(([ref, quantity]) => {
      const { id } = pbByRef[ref] ?? bad(Err.NOT_FOUND, ref);
      return quantity ? { itemId: id, quantity } : null;
    })
    .filter((p) => p != null);

  const cat = fhcCostCategoryOf(dto);
  const isPriceBook = cat === FhcCostCategory.PRICE_BOOK;
  if (isPriceBook && !quantities.length) {
    bad(Err.PRICE_BOOK_REQUIRED);
  } else if (!isPriceBook && quantities.length) {
    bad(Err.PRICE_BOOK_NOT_APPLICABLE);
  }

  return prisma.ftthConnection.update({
    select: ftthConnectionS,
    where: { id: workId },
    data: {
      olt: maybeConnect(dto.oltId),
      fat: maybeConnect(dto.fatId),
      ontOem: maybeIdOrKey(dto.ontOem),
      ontSerial: dto.ontSerial,
      fatPort: dto.fatPort,
      oltPort: dto.oltPort,
      mode: dto.mode,
      distance: dto.distance,
      withPole: dto.withPole,
      costCategory: cat,
      quantities: {
        deleteMany: { id: { notIn: quantities.map((c) => c.itemId) } },
        upsert: quantities.map(({ quantity, itemId }) => ({
          where: { uniq: { workId, itemId } },
          create: { quantity, itemId },
          update: { quantity },
        })),
      },
      work: updateWork({
        status: WorkStatus.REVIEW,
        action: WorkAction.SUBMIT_REPORT,
        work: fhc.work,
        dto,
        sender: from,
        docs: dto.images,
      }),
    },
  });
}

type Where = Prisma.FtthConnectionWhereUniqueInput;

async function mustNotExist(id: string, param: string, where: Where) {
  const found = await db.findUnique({ where, select: { id: true } });
  if (found && found.id !== id) bad(Err.ALREADY_ASSIGNED, param);
}
