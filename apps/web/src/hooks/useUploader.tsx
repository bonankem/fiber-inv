import { createContext, use, useCallback, useMemo, useState } from "react";
import { omit } from "remeda";
import type { WorkDocType } from "schema/enums";
import { type UploadParsedT, uploadFullZ } from "schema/uploads";
import { jsonResponse, type Maybe } from "schema/utils";
import { uuidv7 } from "uuidv7";
import AuthProvider from "#/api/AuthProvider";
import { apiUrl, showAppError, useApiPost } from "#/api/helpers";

export type UploadRecord = {
  id: string;
  name: string;
  size: number;
  done: boolean;
  type?: WorkDocType;
  percent: number;
  formId?: string;
};

type SendArgs = {
  type?: WorkDocType;
  formId?: string;
  onParse?: (p: UploadParsedT | null) => void;
};

export type Uploader = {
  find(id: string): UploadRecord | undefined;
  send(file: File, args?: SendArgs): UploadRecord;
  cleanup(): void;
  cancel(ids: string | string[]): void;
  maybeCancel(id: Maybe<string>): void;
  isUploading(type?: WorkDocType): boolean;
};

export const UploaderContext = createContext<Uploader>({
  send: (): never => {
    throw new Error("No Uploader context");
  },
  find: () => undefined,
  cancel: () => {},
  cleanup: () => {},
  maybeCancel: () => {},
  isUploading: () => false,
});

export function useUploader() {
  return use(UploaderContext);
}

export function useUploaderImpl(): Uploader {
  type Dict<T> = Record<string, T>;
  const [records, setRecords] = useState<Dict<UploadRecord>>({});
  const [pending, setPending] = useState<Dict<XMLHttpRequest>>({});
  const clean = useApiPost<{ ids: string[] }>("uploads/cleanup");

  const send = useCallback((file: File, args?: SendArgs) => {
    const record: UploadRecord = {
      id: uuidv7(),
      name: file.name,
      size: file.size,
      type: args?.type,
      done: false,
      percent: 0,
      formId: args?.formId ?? "",
    };
    setRecords((rs) => ({ ...rs, [record.id]: record }));

    const id = record.id;
    const xhr = new XMLHttpRequest();

    setPending((p) => ({ ...p, [id]: xhr }));

    const stop = (failed: boolean) => {
      if (failed) showAppError(`Upload failed: ${record.name}`);
      setRecords((rs) => omit(rs, [record.id]));
      setPending((ps) => omit(ps, [id]));
    };

    const finish = () => {
      setRecords((rs) => {
        if (!rs[id]) return rs;
        const update = { done: true, percent: 100 };
        return { ...rs, [id]: { ...rs[id], ...update } };
      });
      setPending((ps) => omit(ps, [id]));
    };

    const percent = (percent: number) => {
      percent = Math.round(percent);
      return setRecords((rs) => {
        if (rs[id]?.done !== false) return rs;
        return { ...rs, [id]: { ...rs[id], percent } };
      });
    };

    xhr.addEventListener("error", () => stop(true));
    xhr.addEventListener("abort", () => stop(false));

    xhr.addEventListener("loadend", () => {
      if (xhr.readyState !== 4) return;
      if (xhr.status >= 300) {
        return stop(true);
      }
      try {
        const data = jsonResponse(xhr.responseText, uploadFullZ);
        args?.onParse?.(data?.parsed || null);
      } catch (e) {
        console.error(e);
        args?.onParse?.(null);
      }
      return finish();
    });

    xhr.upload.addEventListener("progress", (e) => {
      if (!e.lengthComputable) return;
      percent((100 * e.loaded) / e.total);
    });

    const data = new FormData();
    data.append("file", file);

    const url = new URL(apiUrl("uploads"));
    url.searchParams.set("id", id);
    if (args?.type) {
      url.searchParams.set("parser", args?.type);
    }
    const token = AuthProvider.fetchToken();
    xhr.open("POST", url, true);
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.send(data);
    return record;
  }, []);

  return useMemo(() => {
    const find = (id: string) => records[id];

    const cancel = (id: string | string[]) => {
      const ids = Array.isArray(id) ? id : [id];
      ids.forEach((id) => void pending[id]?.abort);
      clean.mutate({ ids });
      setPending((ps) => omit(ps, ids));
      setRecords((rs) => omit(rs, ids));
    };

    const maybeCancel = (id: Maybe<string>) => {
      if (id) cancel(id);
    };

    const cleanup = () => {
      Object.values(pending).forEach((p) => p.abort());
      const ids = Object.values(records).map((r) => r.id);
      setPending({});
      setRecords({});
      if (ids.length) clean.mutate({ ids });
    };

    const isUploading = (type?: WorkDocType) => {
      const rs = Object.values(records);
      if (!type) return rs.some((r) => !r.done);
      return rs.some((r) => r.type === type && !r.done);
    };

    return { find, send, cancel, cleanup, maybeCancel, isUploading };
  }, [pending, records, clean.mutate, send]);
}
