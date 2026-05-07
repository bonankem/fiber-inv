import { useMutation } from "@tanstack/react-query";
import { createContext, use, useCallback, useMemo, useState } from "react";
import { omit } from "remeda";
import { uuidv7 } from "uuidv7";
import { apiUrl, postFn } from "#/api/helpers";

export enum UploadStatus {
  SENDING = "SENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
  NONE = "NONE",
}

export type UploadRecord = {
  id: string;
  name: string;
  size: number;
  status: UploadStatus;
  percent: number;
  formId?: string;
};

const none: UploadRecord = {
  id: "",
  name: "",
  size: 0,
  status: UploadStatus.NONE,
  percent: 0,
};

const getNone = () => none;

export type Uploader = {
  find(id: string): UploadRecord;
  findMany(ids: string[]): UploadRecord[];

  send(file: File, formId: string): UploadRecord;
  sendMany(files: File[], formId: string): UploadRecord[];

  cancel(id: string | string[]): void;

  finish(formId: string): void;
};

export const UploaderContext = createContext<Uploader>({
  find: getNone,
  send: getNone,
  cancel: getNone,
  finish: () => {},
  findMany: (a) => a.map(getNone),
  sendMany: (a) => a.map(getNone),
});

export function useUploader() {
  return use(UploaderContext);
}

export function useUploaderImpl(): Uploader {
  type Dict<T> = Record<string, T>;
  const [records, setRecords] = useState<Dict<UploadRecord>>({});
  const [pending, setPending] = useState<Dict<XMLHttpRequest>>({});
  const { SENDING, SUCCESS, CANCELLED, FAILED } = UploadStatus;

  const cleanup = useMutation({
    mutationFn: postFn<{ ids: string[] }>("uploads/cleanup"),
  });

  const upload = useCallback((file: File, formId: string) => {
    const record: UploadRecord = {
      id: uuidv7(),
      name: file.name,
      size: file.size,
      status: SENDING,
      percent: 0,
      formId,
    };
    setRecords((rs) => ({ ...rs, [record.id]: record }));

    const id = record.id;
    const xhr = new XMLHttpRequest();
    const clearXhr = () => setPending((p) => omit(p, [id]));

    const update = (status: UploadStatus | number) => {
      if (typeof status === "number") {
        return setRecords((rs) => {
          if (rs[id]?.status !== SENDING) return rs;
          return { ...rs, [id]: { ...rs[id], percent: status } };
        });
      }
      setRecords((rs) => {
        if (!rs[id]) return rs;
        return { ...rs, [id]: { ...rs[id], status, percent: 100 } };
      });
      // if a final status has been set, the request is over
      if (typeof status !== "number") clearXhr();
    };

    xhr.addEventListener("error", () => update(FAILED));
    xhr.addEventListener("abort", () => update(CANCELLED));

    xhr.addEventListener("loadend", () => {
      console.log("onloadend", xhr.readyState, xhr.status);
      if (xhr.readyState !== 4) return;
      update(xhr.status < 300 ? SUCCESS : FAILED);
    });

    xhr.upload.addEventListener("progress", (event) => {
      if (!event.lengthComputable) return;
      const fraction = event.loaded / event.total;
      update(Math.round(fraction * 100));
    });

    setPending((p) => ({ ...p, [id]: xhr }));
    const url = new URL(apiUrl("uploads"));
    url.searchParams.set("id", id);
    xhr.open("POST", url, true);

    const data = new FormData();
    data.append("file", file);
    xhr.send(data);

    return record;
  }, []);

  return useMemo(() => {
    const find = (id: string) => records[id] || none;

    const findMany = (ids: string[]) => ids.map(find);

    const send = (file: File, formId: string) => {
      return upload(file, formId);
    };

    const sendMany = (fs: File[], i: string) => {
      return fs.map((f) => upload(f, i));
    };

    const abort = (id: string) => {
      pending[id]?.abort();
    };

    const cancel = (id: string | string[]) => {
      const ids = Array.isArray(id) ? id : [id];
      ids.forEach(abort);
      cleanup.mutate({ ids });
      setPending((ps) => omit(ps, ids));
      setRecords((rs) => omit(rs, ids));
    };

    const finish = (formId: string) => {
      const items = Object.values(records).filter((r) => r.formId === formId);
      cancel(items.map((i) => i.id));
    };

    return { find, findMany, send, sendMany, cancel, finish };
  }, [pending, records, upload, cleanup.mutate]);
}
