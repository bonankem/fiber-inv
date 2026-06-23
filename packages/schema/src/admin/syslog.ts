import type { Prisma } from "../prisma";
import { type Same, z, zObject, zStr } from "../utils";

export const syslogS = {
  host: true,
  port: true,
  enabled: true,
} satisfies Prisma.SyslogSelect;

export const syslogZ = zObject("SyslogT", {
  host: zStr("Syslog server host"),
  port: z.int().describe("Syslog server port"),
  enabled: z.boolean().describe("Is sending enabled?"),
} satisfies Record<keyof typeof syslogS, object>);

export const syslogP = { select: syslogS };

type SyslogP = Prisma.SyslogGetPayload<typeof syslogP>;
type SyslogZ = z.infer<typeof syslogZ>;

export type SyslogT = Same<SyslogP, SyslogZ>;
