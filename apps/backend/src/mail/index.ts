import { createTransport } from "nodemailer";
import type Mail from "nodemailer/lib/mailer";
import { appEnv } from "#/env";
import type { AppLog, Maybe } from "#/utils";

function getMailTransport() {
  const envUrl = appEnv.MAIL_URL;
  if (!envUrl) return null;

  const url = new URL(envUrl);
  const pro = url.protocol;

  if (pro === "smtp:") {
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

  throw new Error(`Unsupported mail protocol: ${pro}`);
}

function getMailFrom() {
  const address = appEnv.MAIL_FROM;
  const name = appEnv.MAIL_NAME;
  return address ? { name, address } : undefined;
}

const mailer = getMailTransport();
const from = getMailFrom();
let mailLog: AppLog;

export function verifyMail(log: AppLog) {
  mailLog = log;
  if (!mailer) return log.info("No mailer");
  mailer.verify((e) => {
    if (e) log.warn(`Mailer not verified: ${e.message}`);
    else log.info("Mailer verified");
  });
}

type MailData = {
  to: string[];
  subject: string;
  lines: string[];
  fields?: [string, string][];
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

export function escapeHtml(s: string) {
  return s
    .replace(/(\s|<\/?br\/?>)+/g, " ")
    .replace(escapeRe, (e) => escapes[e as Escapable])
    .trim();
}

function cleanText(s: string) {
  return s.replace(/\s+/g, " ").trim();
}

function renderFields({ fields }: MailData) {
  if (!fields?.length) return null;

  const lines = fields.map(([k, v]) => {
    k = escapeHtml(k);
    v = escapeHtml(v);
    return `<b>${k}<b>: ${v}</br>`;
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
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <div class="wrapper">
    <div class="content">
    ${lines.filter(Boolean).join("\n")}
    </div>
    <div style="font-size:4px;color:#f0f0f0">${new Date().toString()}</div>
    </div>
  </body>
  </html>`;
  return result.replace(/\n +/g, "\n").trim();
}

export function sendMail(mail: Maybe<MailData>) {
  if (!mailer || !mail?.to?.length) return;

  const { to, subject, lines } = mail;
  const htmlLines = lines.map((s) => `<p class="line">${escapeHtml(s)}</p>`);
  const textLines = lines.map((s) => cleanText(s));
  const fields = renderFields(mail);
  const button = renderButton(mail);

  const text = composeText(...textLines, fields?.text, button?.href);
  const html = composeHtml(...htmlLines, fields?.html, button?.html);
  const data: Mail.Options = { from, to, subject, html, text };

  mailer.sendMail(data, (e) => {
    if (e) mailLog.warn(`Mail error: ${e.message}`);
  });
}
