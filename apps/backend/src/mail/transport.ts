import { createTransport } from "nodemailer";
import { appEnv } from "#/env";
import type { AppLog } from "#/utils/routing";

function getMailTransport() {
  const envUrl = appEnv.MAIL_URL;
  if (!envUrl) return null;

  const url = new URL(envUrl);
  if (url.protocol !== "smtp:") {
    throw new Error(`Unsupported mail protocol: ${url.protocol}`);
  }

  const user = url.username || undefined;
  const pass = url.password || undefined;
  const secure = appEnv.MAIL_SECURE
    ? appEnv.MAIL_SECURE === "true"
    : !!url.port?.includes("465");
  return createTransport({
    host: url.hostname,
    port: Number(url.port),
    auth: { user, pass },
    secure,
    tls: { rejectUnauthorized: false },
  });
}

export const mailer = getMailTransport();
export let mailLog: AppLog;

export function verifyMail(log: AppLog) {
  mailLog = log;
  if (!mailer) return log.info("No mailer");
  mailer.verify((e) => {
    if (e) log.warn(`Mailer not verified: ${e.message}`);
    else log.info("Mailer verified");
  });
}
