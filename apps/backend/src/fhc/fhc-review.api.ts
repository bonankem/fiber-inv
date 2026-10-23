import { StaffRole, WorkAction, WorkStatus } from "schema/enums";
import { bad, Err, mustHaveFields } from "schema/errors";
import { ftthConnectionS } from "schema/fhc";
import { type FhsReviewT, fhsReviewZ } from "schema/fhs";
import type { UserT } from "schema/people";
import { workFullP } from "schema/work";
import { prisma } from "#/db";
import { sendMail, toMtn, toVendor } from "#/mail/send";
import { postRoute } from "#/utils/routing";
import { updateWork } from "../utils/work";

export const fhcReviewApi = postRoute({
  url: "/fhc/review",
  schema: fhsReviewZ,
  handler: (req) => fhcReview(req.body, req.authUser),
});

async function fhcReview(dto: FhsReviewT, from: UserT) {
  const fhc = await prisma.ftthConnection.findUnique({
    where: { id: dto.id },
    include: { work: workFullP },
  });
  if (!fhc) bad(Err.NOT_FOUND);

  const ok = dto.passed;
  if (!ok) mustHaveFields(dto, "comment");

  const result = await prisma.ftthConnection.update({
    select: ftthConnectionS,
    where: { id: dto.id },
    data: {
      work: updateWork({
        dto,
        work: fhc.work,
        status: ok ? WorkStatus.CONFIGURATION : WorkStatus.FAILED_REVIEW,
        action: ok ? WorkAction.PASS_REVIEW : WorkAction.FAIL_REVIEW,
        logTo: fhc.work?.vendor,
        sender: from,
      }),
    },
  });

  sendMail({
    to: [toMtn(StaffRole.HOME_INTERNET), toVendor(result)],
    // Installation review passed/failed in French
    subject: ok
      ? `Examen de l'installation validé: ${result.tn}`
      : `Examen de l'installation échoué: ${result.tn}`,
    body: [
      `L'examen de l'installation pour la TN ${result.tn} a été ${ok ? "validé" : "échoué"}`,
      !ok && dto.comment ? `Commentaire: ${dto.comment}` : "",
    ],
    button: "/ftth-connections",
    fields: [
      ["TN", result.tn],
      ["Nom", result.work.name],
      ["Localité", result.work.locality?.name],
    ],
  });
  return result;
}
