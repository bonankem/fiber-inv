import { type FhcFilterT, fhcFilterZ, ftthConnectionS } from "schema/fhc";
import { coordsToStr } from "schema/geo";
import type { UserFullT } from "schema/people";
import { prisma } from "#/db";
import { sendCsv } from "#/utils/csv";
import { type AnyReply, getRoute } from "#/utils/routing";
import { fhcWhere } from "./filter";

export const fhcListApi = getRoute({
  url: "/fhc",
  schema: fhcFilterZ,
  handler: (req) => fhcList(req.query, req.authUser),
});

async function fhcList(input: FhcFilterT, user: UserFullT) {
  return prisma.ftthConnection.findMany({
    where: fhcWhere(input, user),
    select: ftthConnectionS,
    orderBy: { work: { sid: "desc" } },
    take: input.count || 100,
  });
}

export const fhcReportApi = getRoute({
  url: "/fhc/report",
  schema: fhcFilterZ,
  handler: (req, _, reply) => fhcReport(req.query, req.authUser, reply),
});

async function fhcReport(input: FhcFilterT, user: UserFullT, reply: AnyReply) {
  const list = await fhcList(input, user);
  return sendCsv(reply, list, {
    TN: (t) => t.tn,
    Nom: (t) => t.work.name,
    Localité: (t) => t.work.locality?.name,
    District: (t) => t.work.locality?.district?.name,
    Coordonnées: (t) => coordsToStr(t.work.coords),
    Fournisseur: (t) => t.work.vendor?.name,
    PBO: (t) => t.fat?.name,
    Distance: (t) => t.distance,
    Mode: (t) => t.mode,
    ONT: (t) => t.ontSerial,
    Poteau: (t) => (t.withPole == null ? null : t.withPole ? "Oui" : "Non"),
  });
}
