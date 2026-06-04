import { type FhpPostImagesT, fhpPostImagesZ, ftthProjectS } from "schema/fhp";
import type { UserFullT } from "schema/people";
import { workP } from "schema/work";
import { type Prisma, prisma, WorkAction, WorkDocType } from "#/db";
import { connectId, notFound, postRoute } from "#/utils";
import { create } from "#/utils/queries";
import { updateWork } from "#/utils/work";

export default postRoute(
  "/fhp/images",
  () => fhpPostImagesZ,
  (req) => fhpPostImages(req.body, req.authUser),
);

async function fhpPostImages(dto: FhpPostImagesT, from: UserFullT) {
  const now = new Date();
  const fhp = await prisma.ftthProject.findUnique({
    where: { id: dto.id },
    include: { work: workP, images: true },
  });
  if (!fhp) notFound();

  const remove = new Set(dto.remove ?? []);
  const imagesToRemove = fhp.images.filter((i) => remove.has(i.id));
  const docIdsToRemove = imagesToRemove.map((i) => i.docId);
  const docsToRemove = { id: { in: docIdsToRemove } };

  await prisma.ftthProject.update({
    select: ftthProjectS,
    where: { id: dto.id },
    data: {
      images: {
        upsert: imageUpserts(dto, now),
        deleteMany: { id: { in: dto.remove ?? [] } },
      },
      work: updateWork({
        action: WorkAction.UPLOAD_IMAGES,
        from,
        dto,
        old: fhp.work,
        also: { docs: { deleteMany: docsToRemove } },
      }),
    },
  });
}

type ImageUpsert = Prisma.FhpImageUpsertWithWhereUniqueWithoutFhpInput;
function imageUpserts(dto: FhpPostImagesT, now: Date): ImageUpsert[] {
  return dto.images.map((i) => {
    const { name, type, uploadId } = i;
    const upload = connectId(uploadId);
    const key = `${type}/${name}`;
    return {
      create: {
        name,
        type,
        createdAt: now,
        updatedAt: now,
        doc: create({
          work: connectId(dto.id),
          type: WorkDocType.FHP_IMAGE,
          upload,
          key,
        }),
      },
      update: { updatedAt: now, doc: { update: { upload } } },
      where: { uniq: { fhpId: dto.id, name, type } },
    };
  });
}
