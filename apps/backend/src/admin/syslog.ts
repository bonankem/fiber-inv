import { CEF } from "syslog-pro";
import { type AuthAction, prisma } from "#/db";

const params: CEF.Options = {
  deviceVendor: "Zoracom",
  deviceProduct: "ServiceX",
  deviceVersion: "1.0",
  server: {
    target: "127.0.0.1",
    port: 8514,
    protocol: "udp",
  },
};

export async function initSyslogServer() {
  const data = await prisma.syslog.findFirst();
  if (data) {
    params.server = {
      target: data.host,
      port: data.port,
      protocol: "udp",
    };
  }
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
};

type Info = {
  ip?: string;
  email?: string;
};

export async function sendSyslog(action: AuthAction, info?: Info) {
  if (!params.server) return;
  const log = new CEF({
    ...params,
    name: action,
    severity: severities[action],
    deviceEventClassId: classIds[action].toString(),
    extensions: info,
  });
  await log.send().catch(() => {});
}
