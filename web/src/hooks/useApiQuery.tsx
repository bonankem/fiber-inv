import { useState } from "react";
import type { ZodType } from "schema/utils";
import { useApiGet } from "#/api/helpers";

type InputBase = {
  page?: number;
  count?: number;
};

function hasChanged(a: unknown, b: unknown) {
  return (a ?? "") !== (b ?? "");
}

export function useApiQuery<I extends InputBase, O>(args: {
  url: string | [string, ...string[]];
  key?: string[];
  input: ZodType<I>;
  output: ZodType<O>;
  defaults?: Partial<I>;
}) {
  const [dto, setDto] = useState<I>(
    () => ({ ...(args.defaults ?? {}), page: 1, count: 100 }) as I,
  );
  const query = useApiGet(args.url, args.output, dto);

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
