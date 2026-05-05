import { type Prisma, type Same, type z, zObject, zStr } from "../common";

export const vendorS = {
  id: true,
  key: true,
  name: true,
} satisfies Prisma.VendorSelect;

export const vendorZ = zObject("VendorT", {
  id: zStr("The vendor's UUID"),
  key: zStr("The vendor's unique key, generated from the name"),
  name: zStr("The vendor's name"),
} satisfies Record<keyof typeof vendorS, object>);

export const vendorP = {
  select: vendorS,
} satisfies Prisma.VendorFindManyArgs;

type VendorP = Prisma.VendorGetPayload<typeof vendorP>;
type VendorZ = z.infer<typeof vendorZ>;

export type VendorT = Same<VendorP, VendorZ>;
