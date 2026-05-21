import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { ZodType } from "schema/utils";
import { getJson } from "#/api/helpers";

type InputBase = {
  page?: number;
  count?: number;
};

function initialInput<I extends InputBase>() {
  return { page: 1, count: 100 } as I;
}

function defaultKey(url: string) {
  return url.replace(/^\//, "").split("/");
}

function hasChanged(a: unknown, b: unknown) {
  return (a ?? "") !== (b ?? "");
}

export function useApiQuery<I extends InputBase, O>(args: {
  url: string;
  key?: string[];
  input: ZodType<I>;
  output: ZodType<O>;
  defaults?: Partial<I>;
}) {
  const [dto, setDto] = useState<I>(
    () => ({ ...(args.defaults ?? {}), page: 1, count: 100 }) as I,
  );
  const query = useQuery({
    queryFn: () => getJson(args.url, args.output, dto),
    queryKey: [...(args.key || defaultKey(args.url)), dto],
    staleTime: 1000 * 60 * 5,
  });

  const update = (up: Partial<I>) => {
    setDto((dto) => ({ ...dto, ...up }));
  };

  const setter = <K extends keyof I>(key: K) => {
    return (value: I[K]) => {
      if (hasChanged(dto[key], value)) {
        setDto((dto) => ({ ...dto, page: 1, [key]: value }));
      }
    };
  };

  return {
    dto,
    query,
    update,
    setter,
  };
}
