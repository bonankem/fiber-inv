import { createTransport } from "nodemailer";
import type Mail from "nodemailer/lib/mailer";
import { filterTruthy } from "schema/utils";
import { appEnv } from "#/env";
import type { AppLog } from "#/utils";

function getMailTransport() {
  const envUrl = appEnv.MAIL_URL;
  if (!envUrl) return null;

  const url = new URL(envUrl);
  const pro = url.protocol;

  if (pro === "smtp:") {
    const user = url.username || undefined;
    const pass = url.password || undefined;
    return createTransport({
      host: url.hostname,
      port: Number(url.port),
      auth: { user, pass },
      secure: url.port?.includes("465"),
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
  button?: `/${string}` | false;
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

function renderHtmlFields(mail: MailData) {
  if (!mail.fields?.length) return "";
  const lines = mail.fields.map(([k, v]) => {
    k = escapeHtml(k);
    v = escapeHtml(v);
    return `<b>${k}<b>: ${v}</br>`;
  });
  return `<p>${lines.join("")}</p>`;
}

function renderTextFields(mail: MailData) {
  if (!mail.fields?.length) return "";
  return mail.fields
    .map(([k, v]) => `${cleanText(k)}: ${cleanText(v)}\n`)
    .join("");
}

const frontendUrl = appEnv.FRONTEND_URL?.replace(/\/$/, "");

function getButtonUrl(mail: MailData) {
  const path = mail.button;
  if (!path || !frontendUrl) return "";
  return new URL(path, frontendUrl).href;
}

function composeHtml(lines: (string | string[])[]) {
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
    ${lines.flat().filter(Boolean).join("\n")}
    </div>
    <div style="font-size:4px;color:#f0f0f0">${new Date().toString()}</div>
    </div>
  </body>
  </html>`;
  return result.replace(/\n +/g, "\n").trim();
}

function getButtonHtml(url: string) {
  if (!url) return "";
  return `<p><a href="${url}"
    class="button"
    style="background-color: #ffcb05; color: #000000">
    Open ServiceX
  </button></a><p>`.replace(/\n */g, " ");
}

export function sendMail(mail: MailData) {
  if (!mailer) return;

  const { to, subject, lines } = mail;
  if (mail.to.length === 0) return;

  const htmlLines = lines.map((s) => `<p class="line">${escapeHtml(s)}</p>`);
  const textLines = lines.map((s) => cleanText(s));
  const htmlField = renderHtmlFields(mail);
  const textField = renderTextFields(mail);
  const url = getButtonUrl(mail);
  const button = getButtonHtml(url);

  const text = filterTruthy([...textLines, textField, url]).join("\n\n");
  const html = composeHtml([...htmlLines, htmlField, button]);

  const options: Mail.Options = { to, from, subject, html, text };
  mailLog.info("About to send");
  mailer.sendMail(options, (e) => {
    if (e) mailLog.warn(`Mail error: ${e.message}`);
    else mailLog.info("Mail sent");
    mailLog.info("Mail done");
  });
}
