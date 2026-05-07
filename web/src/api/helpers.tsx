import { message } from "antd";

const base = (
  (import.meta.env.VITE_API_URL as string) || "http://localhost:3000"
).replace(/localhost|127.0.0.1/, window.location.hostname);

export function apiUrl(url: string) {
  if (/^https?:/i.test(url)) return url;
  if (base.endsWith("/")) return `${base}${url.replace(/^\//, "")}`;
  if (url.startsWith("/")) return `${base}${url}`;
  return `${base}/${url}`;
}

export function postFn<I, O = void>(url: string) {
  return (body: I) => postJson<O>(url, body);
}

export async function postJson<R>(url: string, body: unknown) {
  const res = await fetch(apiUrl(url), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (res.ok) return data as R;

  const message = data.message || "API error";
  throw new Error(message);
}

export function showApiError(e: unknown) {
  const error = e instanceof Error ? e.message : "Failed";
  message.error(error);
}

export function apiCall<I, O>(f: (i: I) => O) {
  return async (i: I) => {
    try {
      return await f(i);
    } catch (e) {
      showApiError(e);
    }
  };
}
