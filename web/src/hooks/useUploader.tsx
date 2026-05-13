import { useMutation } from "@tanstack/react-query";
import { createContext, use, useCallback, useMemo, useState } from "react";
import { omit } from "remeda";
import type { WorkDocType } from "schema/enums";
import { type UploadParsedT, uploadFullZ } from "schema/uploads";
import { jsonResponse } from "schema/utils";
import { uuidv7 } from "uuidv7";
import { apiUrl, postFn, showAppError } from "#/api/helpers";

export type UploadRecord = {
  id: string;
  name: string;
  size: number;
  done: boolean;
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
  cancel(ids: string[]): void;
  finish(formId: string): void;
};

export const UploaderContext = createContext<Uploader>({
  send: (): never => {
    throw new Error("No Uploader context");
  },
  find: () => undefined,
  cancel: () => undefined,
  finish: () => {},
});

export function useUploader() {
  return use(UploaderContext);
}

export function useUploaderImpl(): Uploader {
  type Dict<T> = Record<string, T>;
  const [records, setRecords] = useState<Dict<UploadRecord>>({});
  const [pending, setPending] = useState<Dict<XMLHttpRequest>>({});

  const cleanup = useMutation({
    mutationFn: postFn<{ ids: string[] }>("uploads/cleanup"),
  });

  const send = useCallback((file: File, args?: SendArgs) => {
    const record: UploadRecord = {
      id: uuidv7(),
      name: file.name,
      size: file.size,
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
      } catch (_) {
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
    xhr.open("POST", url, true);
    xhr.send(data);
    return record;
  }, []);

  return useMemo(() => {
    const find = (id: string) => records[id];

    const cancel = (id: string | string[]) => {
      const ids = Array.isArray(id) ? id : [id];
      ids.forEach((id) => void pending[id]?.abort);
      cleanup.mutate({ ids });
      setPending((ps) => omit(ps, ids));
      setRecords((rs) => omit(rs, ids));
    };

    const finish = (formId: string) => {
      const ids = Object.values(records)
        .filter((r) => r.formId === formId)
        .map((r) => r.id);
      cancel(ids);
    };

    return { find, send, cancel, finish };
  }, [pending, records, cleanup.mutate, send]);
}
