import {
  PlanKmzIssue,
  type UpPlanKmzIssueT,
  type UpPlanKmzT,
} from "schema/uploads";
import { BoxType, WorkDocType } from "#/db";
import { filterPlacemarks, type KmzPlacemark, parseSimpleKmz } from "./kmz";
import type { ParserInput } from "./utils";

export async function parseUpPlanKmz({
  data,
}: ParserInput): Promise<UpPlanKmzT | null> {
  const kmz = await parseSimpleKmz(data);
  if (!kmz) return null;

  const metalPoles = filterPlacemarks(
    kmz,
    true,
    [/poteau|pole/i, /metal|steel|^s[- ]*\d/iu],
    [/exist/i],
  );

  const concretePoles = filterPlacemarks(
    kmz,
    true,
    [/poteau|pole/i, /b[eé]ton|concrete|^c[- ]*\d/iu],
    [/exist/i],
  );

  const boxes = filterPlacemarks(kmz, true, [/boitiers|boxes/i], [/exist/i]);
  const cables = filterPlacemarks(kmz, false, [/c[âa]ble/i], [/exist/i]);

  // TODO: match FATs to boundaries
  // const bounds = filterPlacemarks(
  //   kmz,
  //   false,
  //   [/zones?.?influence|fat.?bound/i],
  //   [/exist/i],
  // );

  // there is a possibility that, in the KMZ, the boxes are labelled with
  // the cable names instead of the actual box names; the code below
  // attempts to detect and correct this by deducing the proper box names
  // and also assigning the proper cable names to the cables if needed

  const dicRe = /^(\w+)\/X\d+\/H\d+(\/S\d+(\/[SE]\d+)?)?\/\d+$/;
  const trcRe = /^(\w+)\/T\d+\/TR\/\d+\/\d+$/;
  const boxRe = /^(\w+)-X\d+(-H\d+(-[SE]\d+)?)?$/;

  const issues: UpPlanKmzIssueT[] = [];

  for (const box of boxes) {
    const name = box.name;
    if (boxRe.test(name)) continue;
    const match = dicRe.exec(name);
    if (!match) {
      issues.push({ type: PlanKmzIssue.INCORRECT_BOX_NAME, name });
      continue;
    }
    const newName = box.name
      .replace(/\//g, "-")
      .replace(/-\d+$/, "")
      .replace(/-S\d+-/, "-")
      .replace(/(?<=[XHSE])(?=\d\b)/g, "0");
    box.oldName = box.name;
    box.name = newName;
  }

  for (const cable of cables) {
    const name = cable.name;
    if (!dicRe.test(name) && !trcRe.test(name)) {
      issues.push({ type: PlanKmzIssue.INCORRECT_BOX_NAME, name });
    }
  }

  boxes.sort(nameSort);
  cables.sort(nameSort);
  metalPoles.sort(nameSort);
  concretePoles.sort(nameSort);

  return {
    type: WorkDocType.PLAN_KMZ,
    boxes: boxes.map((b) => ({
      name: b.name,
      type: getBoxType(b),
      coords: b.geom[0],
    })),
    issues,
    cables,
    metalPoles,
    concretePoles,
  };
}

function getBoxType(b: KmzPlacemark) {
  if (/-E\d+$/.test(b.name)) return BoxType.END;
  if (/-S\d+$/.test(b.name)) return BoxType.SUB;
  if (/-H\d+$/.test(b.name)) return BoxType.HUB;
  if (/-X\d+$/.test(b.name)) return BoxType.X;
  return BoxType.END;
}

function nameSort(a: { name: string }, b: { name: string }) {
  const n1 = a.name.replace(/\bE(?=\d)/, "Z").toUpperCase();
  const n2 = b.name.replace(/\bE(?=\d)/, "Z").toUpperCase();
  return n1.localeCompare(n2);
}
