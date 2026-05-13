import { message } from "antd";
import { jsonResponse, type ZodType } from "schema/utils";

const base = (
  (import.meta.env.VITE_API_URL as string) || "http://localhost:3000"
).replace(/localhost|127.0.0.1/, window.location.hostname);

export function apiUrl(url: string) {
  if (/^https?:/i.test(url)) return url;
  if (base.endsWith("/")) return `${base}${url.replace(/^\//, "")}`;
  if (url.startsWith("/")) return `${base}${url}`;
  return `${base}/${url}`;
}

type Query = {
  [key in string]?:
    | null
    | string
    | number
    | boolean
    | { toJSON(): string | number };
};

export function postFn<I, O = void>(url: string) {
  return (body: I) => postJson<I, O>(url, body);
}

export async function postJson<I, O>(url: string, body: I) {
  const res = await fetch(apiUrl(url), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (res.ok) return data as O;

  const message = data.message || "API error";
  throw new Error(message);
}

export async function getJson<O, I extends Query = Query>(
  getUrl: string,
  zShape: ZodType<O>,
  query?: I,
) {
  const url = new URL(apiUrl(getUrl));
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v === null || v === undefined) return;
      const s = typeof v === "object" ? v.toJSON() : v;
      url.searchParams.append(k, s.toString());
    });
  }
  const res = await fetch(url);
  const data = await res.json();

  if (res.ok) return jsonResponse(data, zShape);
  const message = data.message || "API error";
  throw new Error(message);
}

function errorMessage(e: unknown) {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  return "An error occured";
}

export function showAppError(e: unknown) {
  message.error(errorMessage(e));
}

export function apiCall<I, O>(f: (i: I) => O) {
  return async (i: I) => {
    try {
      return await f(i);
    } catch (e) {
      showAppError(e);
    }
  };
}
