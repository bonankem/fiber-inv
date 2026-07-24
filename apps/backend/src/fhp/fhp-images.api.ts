import { WorkAction, WorkDocType, WorkStatus } from "schema/enums";
import { type FhpPostImagesT, fhpPostImagesZ, ftthProjectS } from "schema/fhp";
import { prisma } from "#/db";
import { connectId } from "#/utils/ids";
import { postRoute } from "#/utils/routing";
import { updateWork } from "../utils/work";
import { fhpCheck } from "./utils";

export const fhpImagesApi = postRoute({
  url: "/fhp/images",
  schema: fhpPostImagesZ,
  handler: (req) => fhpImages(req.body),
});

async function fhpImages(dto: FhpPostImagesT) {
  const { s } = await fhpCheck({
    workId: dto.id,
    status: [WorkStatus.INSTALLATION, WorkStatus.FAILED],
  });

  for (const i of dto.images) {
    i.name = i.name.toUpperCase();
    if (i.type === WorkDocType.FHP_BOX) {
      i.name = i.name.replace(/[-_ /]+/g, "-");
    }
  }

  const remove = { in: dto.remove ?? [] };
  return prisma.ftthProject.update({
    select: ftthProjectS,
    where: { id: dto.id },
    data: {
      work: updateWork({
        dto,
        old: s.work,
        action: WorkAction.UPLOAD_IMAGES,
        also: {
          docs: {
            deleteMany: { id: remove },
            upsert: dto.images.map(({ type, name: key, uploadId }) => ({
              where: { uniq: { workId: dto.id, key, type } },
              create: { type, key, upload: connectId(uploadId) },
              update: { type, key },
            })),
          },
        },
      }),
    },
  });
}
