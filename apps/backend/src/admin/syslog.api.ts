import console from "node:console";
import type { SyslogT } from "schema/admin";
import { syslogZ } from "schema/admin";
import { CEF } from "syslog-pro";
import { type AuthAction, prisma } from "#/db";
import { type AnyRequest, getRoute, postRoute } from "#/utils";

const defaultSyslog: SyslogT = {
  host: "127.0.0.1",
  port: 514,
  enabled: false,
};

export let syslogServer = defaultSyslog;

const params: CEF.Options = {
  deviceVendor: "Zoracom",
  deviceProduct: "ServiceX",
  deviceVersion: "1.0",
};

export async function initSyslogServer() {
  const data = await prisma.syslog.findFirst();
  if (data) syslogServer = data;
}

const severities: Record<AuthAction, CEF.Severity> = {
  CHANGE_PASSWORD: "Low",
  FORGOT_PASSWORD: "Low",
  LOGIN_SUCCESS: "Low",
  LOGOUT: "Low",
  OTP_FAILED: "Medium",
  PASSWORD_FAILED: "Medium",
  LOCKOUT: "High",
  ADD_USER: "Low",
  EXPIRED: "Low",
  UNLOCKED_BY_ADMIN: "Low",
};

const classIds: Record<AuthAction, number> = {
  LOGIN_SUCCESS: 1,
  PASSWORD_FAILED: 2,
  OTP_FAILED: 3,
  LOCKOUT: 4,
  FORGOT_PASSWORD: 4,
  CHANGE_PASSWORD: 5,
  LOGOUT: 6,
  ADD_USER: 7,
  EXPIRED: 8,
  UNLOCKED_BY_ADMIN: 9,
};

type Info = {
  ip?: string;
  email?: string;
};

export async function authLog(
  action: AuthAction,
  req: AnyRequest | null,
  email: string,
) {
  await prisma.authLog.create({
    data: {
      action,
      email,
      ipAddress: req?.ip ?? "",
      userAgent: req?.headers["user-agent"] ?? "",
    },
  });

  if (!syslogServer.enabled) {
    console.log("syslog disabled");
    return;
  }
  const log = new CEF({
    ...params,
    server: {
      target: syslogServer.host,
      port: syslogServer.port,
      protocol: "udp",
    },
    name: action,
    severity: severities[action],
    deviceEventClassId: classIds[action].toString(),
    extensions: { email, ip: req?.ip },
  });
  await log.send().catch(() => {});
}

export const getSyslogApi = getRoute("/admin/syslog", null, () => syslogServer);

export const setSyslogApi = postRoute(
  "/admin/syslog",
  () => syslogZ,
  async ({ body }) => {
    await prisma.syslog.upsert({
      where: { id: "ID" },
      update: body,
      create: body,
    });
    syslogServer = body;
    console.log(syslogServer);
    return { success: true };
  },
);
