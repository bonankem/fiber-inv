import { type ChangeEvent, useCallback, useState } from "react";
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

  const update = useCallback((up: Partial<I>) => {
    setDto((dto) => ({ ...dto, ...up }));
  }, []);

  const setter = useCallback(<K extends keyof I>(key: K) => {
    return (value: I[K]) => {
      setDto((dto) => {
        return hasChanged(dto[key], value)
          ? { ...dto, page: 1, [key]: value }
          : dto;
      });
    };
  }, []);

  const onChange = useCallback(<K extends keyof I>(key: K) => {
    return (event: ChangeEvent<HTMLInputElement>) => {
      const value = (event.target.value as I[K]) || undefined;
      setDto((dto) => {
        return hasChanged(dto[key], value)
          ? { ...dto, page: 1, [key]: value }
          : dto;
      });
    };
  }, []);

  return {
    dto,
    query,
    update,
    setter,
    onChange,
  };
}
