import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import type { IdNameT } from "schema/common";
import { jsonResponse, type Maybe, type ZodType } from "schema/utils";
import { useAuthToken } from "./auth";

function defaultApiUrl() {
  const { hostname, port, protocol } = window.location;
  const base = `${protocol}//${hostname}`;
  const isMainPort = !port || port === "80" || port === "443";
  const isProduction = isMainPort || /^https/i.test(protocol);
  return isProduction ? `${base}/api` : `${base}:4000`;
}

export const apiBaseUrl: string = (
  (import.meta.env.VITE_API_URL as string) || defaultApiUrl()
).replace(/\/$/, "");

export function apiUrl(url: string) {
  if (/^https?:/i.test(url)) return url;
  const slash = url.startsWith("/") ? "" : "/";
  return `${apiBaseUrl}${slash}${url}`;
}

export function downloadUrl(up: IdNameT) {
  const name = encodeURIComponent(up.name);
  return apiUrl(`download/${up.id}/${name}`);
}

export function useApiGet<O, I extends Query = Query>(
  path: string | [string, ...string[]],
  output: ZodType<O>,
  query?: I,
  options?: Omit<Parameters<typeof useQuery<O>>[0], "queryFn" | "queryKey">,
) {
  const url = Array.isArray(path) ? path.join("/") : path;
  const key = Array.isArray(path) ? path : path.replace(/^\//, "").split("/");
  const token = useAuthToken();

  return useQuery({
    ...options,
    queryFn: () => getJson(url, output, query, token.value),
    queryKey: query ? [...key, query] : key,
    placeholderData: (prev) => prev,
  });
}

export function useApiGetText(
  path: string | [string, ...string[]],
  options?: Omit<
    Parameters<typeof useQuery<string>>[0],
    "queryFn" | "queryKey"
  >,
) {
  const url = Array.isArray(path) ? path.join("/") : path;
  const key = Array.isArray(path) ? path : path.replace(/^\//, "").split("/");
  const token = useAuthToken();

  return useQuery({
    ...options,
    queryFn: () => getText(url, token.value),
    queryKey: key,
  });
}

export type ApiPath = string | [string, ...string[]];

const noRefreshNeeded = ["uploads/cleanup"];

export function useApiPost<I, O = unknown>(path: ApiPath) {
  const url = Array.isArray(path) ? path.join("/") : path;
  const token = useAuthToken();
  const query = useQueryClient();

  return useMutation({
    mutationFn: (body: I) => postJson<I, O>(url, body, token.value),
    onSuccess: () => {
      const noRefresh = noRefreshNeeded.includes(url.replace(/^\//, ""));
      if (!noRefresh) query.invalidateQueries();
    },
  });
}

export function useApiReport(url: string) {
  const token = useAuthToken().value;
  return useMutation({ mutationFn: () => report(url, token) });
}

async function report(url: string, token?: Maybe<string>) {
  const headers: HeadersInit = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(apiUrl(url), {
    method: "GET",
    headers,
  });

  if (res.ok) return res.text();

  const data = await res.json();
  const message =
    data.message && data.param
      ? `${data.message}: ${data.param}`
      : data.message || "API error";
  throw new Error(message);
}

export function useApiUpload<O>(path: ApiPath) {
  const url = Array.isArray(path) ? path.join("/") : path;
  const token = useAuthToken();
  return useMutation({
    mutationFn: (file: File) => postFile<O>(url, file, token.value),
  });
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

export async function postJson<I, O>(
  url: string,
  body: I,
  token?: Maybe<string>,
) {
  const headers: HeadersInit = {};
  if (body) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(apiUrl(url), {
    method: "POST",
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (res.ok) return data as O;

  const message =
    data.message && data.param
      ? `${data.message}: ${data.param}`
      : data.message || "API error";
  throw new Error(message);
}

export async function postFile<O>(
  url: string,
  file: File,
  token?: Maybe<string>,
) {
  const headers: HeadersInit = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const body = new FormData();
  body.append("file", file);

  const res = await fetch(apiUrl(url), { method: "POST", headers, body });
  const data = await res.json();
  if (res.ok) return data as O;

  const message = data.message || "API error";
  throw new Error(message);
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message?: string,
  ) {
    super(message || "An error occured");
    this.name = "ApiError";
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export function isApiError(e: unknown, status?: number): e is ApiError {
  return e instanceof ApiError && (status ? e.status === status : true);
}

export async function getJson<O, I extends Query = Query>(
  getUrl: string,
  zShape: ZodType<O>,
  query?: I,
  token?: Maybe<string>,
) {
  const url = new URL(apiUrl(getUrl));
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v === null || v === undefined) return;
      const s = typeof v === "object" ? v.toJSON() : v;
      url.searchParams.append(k, s.toString());
    });
  }
  const res = await fetch(url, {
    headers: { Authorization: token ? `Bearer ${token}` : "" },
  });
  const data = await res.json();

  if (res.ok) return jsonResponse(data, zShape);
  throw new ApiError(res.status, data.message);
}

export async function getText(getUrl: string, token?: Maybe<string>) {
  const url = new URL(apiUrl(getUrl));
  const res = await fetch(url, {
    headers: { Authorization: token ? `Bearer ${token}` : "" },
  });
  const data = await res.text();
  return data;
}

function errorMessage(e: unknown) {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  return "An error occured";
}

export function showAppError(e: unknown) {
  const m = errorMessage(e);
  if (m.length < 100) message.error(m);
  else message.error(m.slice(0, 100));
}

export function apiCall<I, O>(f: (i: I) => O | Promise<O>) {
  return async (i: I) => {
    try {
      return await f(i);
    } catch (e) {
      showAppError(e);
    }
  };
}
