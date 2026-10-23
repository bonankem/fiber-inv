import { randomBytes } from "node:crypto";
import { hashSync } from "bcryptjs";
import dayjs from "dayjs";
import { type AuthForgotReqT, authForgotReqZ } from "schema/auth";
import { bad, Err } from "schema/errors";
import type { Maybe } from "schema/utils";
import { prisma } from "#/db";
import { appEnv, isDev } from "#/env";
import { sendMail } from "#/mail/send";
import { type AppLog, postRoute, type RequestWith } from "#/utils/routing";

export const forgotApi = postRoute({
  url: "/auth/forgot",
  schema: authForgotReqZ,
  handler: (req, app) => forgot(req, app.log),
});

const EXPIRY_MINUTES = 30;
const RETRY_SECONDS = 60;
const KEY_BYTES = 16;

async function forgot(req: RequestWith<AuthForgotReqT>, log: AppLog) {
  const { email, turnstile } = req.body;
  await checkTurnstile(turnstile, req.ip, log);

  const db = prisma.passwordReset;
  const last = await db.findFirst({
    where: { email },
    orderBy: { createdAt: "desc" },
  });

  const now = dayjs();
  if (last) {
    const interval = now.diff(last.createdAt, "seconds");
    if (interval < RETRY_SECONDS) bad(Err.WAIT_BEFORE_RETRYING);
  }

  const exp = now.add(EXPIRY_MINUTES, "minutes");
  const key = randomBytes(KEY_BYTES).toString("base64url");
  const secret = randomBytes(KEY_BYTES).toString("base64url");
  const code = `${key}:${secret}`;

  await Promise.all([
    db.deleteMany({ where: { email } }),
    db.create({
      data: {
        key,
        email,
        hashed: hashSync(secret),
        expiresAt: exp.toDate(),
      },
    }),
  ]);

  sendMail({
    to: [email],
    subject: "Reset your password",
    body: ["Click the button below to reset your ServiceX password."],
    button: ["Reset Password", `/reset/${code}`],
  });

  return { success: true };
}

async function checkTurnstile(token: Maybe<string>, ip: string, log: AppLog) {
  const secret = appEnv.TURNSTILE_SECRET;
  if (!secret) return;
  if (!token) bad(Err.BOT_CHECK_FAILED);

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          secret: appEnv.TURNSTILE_SECRET,
          response: token,
          remoteip: ip,
        }),
      },
    );
    const res = await response.json();
    if (isDev) log.info(res);
  } catch (e) {
    if (isDev && e instanceof Error) {
      log.error(`Turnstile error: ${e.message}`);
    }
    bad(Err.BOT_CHECK_FAILED);
  }
}
