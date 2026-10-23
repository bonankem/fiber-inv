import type Mail from "nodemailer/lib/mailer";
import { partition } from "remeda";
import type { Prisma } from "schema/db";
import type { StaffRole, UserLevel } from "schema/enums";
import { type Maybe, whereNone } from "schema/utils";
import { prisma } from "#/db";
import { appEnv, isDev } from "#/env";
import { type HasId, idOf } from "#/utils/ids";
import { mailer, mailLog } from "./transport";

function getMailFrom() {
  const address = appEnv.MAIL_FROM;
  const name = appEnv.MAIL_NAME;
  return address ? { name, address } : undefined;
}

const from = getMailFrom();

type UserWhere = { where: Prisma.UserWhereInput };
type Recipient = string | Mail.Address | UserWhere;

function isUserWhere(recipient: Recipient): recipient is UserWhere {
  return typeof recipient === "object" && "where" in recipient;
}

type MailData = {
  to: Recipient[];
  subject: string;
  body: string[];
  fields?: [string, Maybe<string>][];
  button?: `/${string}` | [string, `/${string}`] | false;
};

const escapes = {
  "<": "&lt;",
  ">": "&gt;",
  "&": "&amp;",
  '"': "&quot;",
};
type Escapable = keyof typeof escapes;
const escapeRe = new RegExp(`[${Object.keys(escapes).join("")}]`, "g");

function escapeHtml(s: Maybe<string>) {
  if (!s) return "";
  return s
    .replace(/(\s|<\/?br\/?>)+/g, " ")
    .replace(escapeRe, (e) => escapes[e as Escapable])
    .trim();
}

function cleanText(s: Maybe<string>) {
  return s ? s.replace(/\s+/g, " ").trim() : "";
}

function renderFields({ fields }: MailData) {
  if (!fields?.length) return null;

  const lines = fields.map(([k, v]) => {
    k = escapeHtml(k);
    v = escapeHtml(v);
    return `<b>${k}</b>: ${v}</br>`;
  });
  const html = `<p class="line">${lines.join("")}</p>`;
  const text = fields
    .map(([k, v]) => `${cleanText(k)}: ${cleanText(v)}\n`)
    .join("");
  return { html, text };
}

const frontendUrl = appEnv.FRONTEND_URL?.replace(/\/$/, "");

function renderButton(mail: MailData) {
  const b = mail.button;
  if (!b || !frontendUrl) return null;

  const path = Array.isArray(b) ? b[1] : b;
  const href = new URL(path, frontendUrl).href;

  const html = `<p><a href="${href}"
    class="button"
    style="background-color: #ffcb05; color: #000000">
    ${Array.isArray(b) ? b[0] : "Open ServiceX"}
  </button></a><p>`.replace(/\n */g, " ");
  return { html, href };
}

function composeText(...lines: Maybe<string>[]) {
  return lines.filter(Boolean).join("\n\n");
}

function composeHtml(...lines: Maybe<string>[]) {
  const result = `
  <!DOCTYPE html>
  <html>
  <head>
    <style type="text/css">
      body, p { margin: 0; padding: 0 }
      .line { margin: 0 0 16px 0; }
      * { box-sizing: border-box !important; }

      body {
        background-color: #f0f0f0;
        font-family: "MTN Brighter Sans", MTNBrighterSans, sans-serif;
        width: 100%;
        overflow-x: hidden;
      }
      .wrapper {
        padding: 24px;
        width: 100%;
      }
      .content {
        background-color: #ffffff;
        border-radius: 12px;
        margin: 0 auto;
        max-width: 500px;
        padding: 24px;
        width: 100%;
      }
      .button {
        background-color: #ffcb05;
        border-radius: 8px;
        color: #000000;
        display: inline-block;
        font-weight: bold;
        padding: 6px 16px;
        margin-top: 16px;
        text-decoration: none;
      }
      .footer {
        font-size:4px;
        color:#f0f0f0;
        max-width:200px;
        margin:0 auto;
        opacity:0.2;
      }
    </style>
  </head>
  <body>
    <div class="wrapper">
    <div class="content">
    ${lines.filter(Boolean).join("\n")}
    </div>
    <div class="footer">${new Date().toString()}</div>
    </div>
  </body>
  </html>`;
  return result.replace(/\n +/g, "\n").trim();
}

export function sendMail(mail: Maybe<MailData>) {
  if (!mailer) return mailLog.info("Mail disabled");
  if (!mail?.to?.length) return mailLog.info("No recipients");

  mailLog.info(`Preparing mail: ${mail.subject}`);
  resolveRecipients(mail.to).then((to) => composeAndSendMail(mail, to));
}

async function resolveRecipients(to: MailData["to"]) {
  const [queries, addresses] = partition(to, (t) => isUserWhere(t));
  const emails = addresses.map((a) => (typeof a === "string" ? a : a.address));
  if (!queries.length) return emails;

  try {
    const users = await prisma.user.findMany({
      where: { OR: queries.map((q) => q.where) },
      select: { email: true },
    });
    return [...emails, ...users.map((u) => u.email)];
  } catch (e) {
    const message =
      e instanceof Error ? e.message.split("\n")[0] : "Unknown error";
    mailLog.warn(`Error fetching recipients: ${message}`);
    return emails;
  }
}

function composeAndSendMail(mail: MailData, to: string[]) {
  if (!mailer) return mailLog.info("Mail disabled");

  if (isDev) {
    const [canSend, no] = partition(to, (e) => /@zoracom.com$/i.test(e));
    if (no.length) mailLog.info(`Dev mode: excluding ${no.join(", ")}`);
    to = canSend;
  }
  if (!to.length) return mailLog.info("No recipients");

  const { subject, body } = mail;
  const htmlLines = body.map((s) =>
    s === "-" ? "<hr/>" : `<p class="line">${escapeHtml(s)}</p>`,
  );
  const textLines = body.map((s) => cleanText(s));
  const fields = renderFields(mail);
  const button = renderButton(mail);

  const text = composeText(...textLines, fields?.text, button?.href);
  const html = composeHtml(...htmlLines, fields?.html, button?.html);
  const data: Mail.Options = { from, to, subject, html, text };

  mailer.sendMail(data, (e) => {
    if (e) mailLog.warn(`Mail error: ${e.message}`);
    else mailLog.info(`Mail sent: ${subject} to ${to.join(", ")}`);
  });
}

export function toMtn(...roles: StaffRole[]): UserWhere {
  return { where: { staffRole: { in: roles } } };
}

export function toVendor(
  v:
    | Maybe<HasId>
    | { vendor: Maybe<HasId> }
    | { work: { vendor: Maybe<HasId> } },
  level?: UserLevel,
): UserWhere {
  if (!v) return { where: whereNone };
  if (typeof v === "string") return { where: { vendorId: v, level } };

  const vendor = "vendor" in v ? v.vendor : "work" in v ? v.work.vendor : v;
  if (!vendor) return { where: whereNone };
  return { where: { vendorId: idOf(vendor), level } };
}
