import { WorkAction, WorkDocType, WorkStatus } from "schema/enums";
import { type FhpPostImagesT, fhpPostImagesZ, ftthProjectS } from "schema/fhp";
import { type Prisma, prisma } from "#/db";
import { postRoute } from "#/utils/routing";
import { updateWork } from "../utils/work";
import { fhpCheck } from "./utils";

export const fhpImagesApi = postRoute({
  url: "/fhp/images",
  schema: fhpPostImagesZ,
  handler: (req) => fhpImages(req.body),
});

async function fhpImages(dto: FhpPostImagesT) {
  const { id: workId, images, remove } = dto;
  const { s } = await fhpCheck({
    workId,
    status: [WorkStatus.INSTALLATION, WorkStatus.FAILED_REVIEW],
  });

  for (const i of images) {
    i.name = i.name.toUpperCase();
    if (i.type === WorkDocType.FHP_BOX) {
      i.name = i.name.replace(/[-_ /]+/g, "-");
    }
  }

  const docs = {
    deleteMany: remove?.length ? { id: { in: remove } } : undefined,
    upsert: images.map(({ type, name: key, uploadId }) => ({
      where: { uniq: { workId, type, key } },
      create: { type, key, uploadId },
      update: { type, key, uploadId },
    })),
  } satisfies Prisma.WorkDocUpdateManyWithoutWorkNestedInput;

  return prisma.ftthProject.update({
    select: ftthProjectS,
    where: { id: dto.id },
    data: {
      work: updateWork({
        dto,
        work: s.work,
        action: WorkAction.UPLOAD_IMAGES,
        also: { docs },
      }),
    },
  });
}
