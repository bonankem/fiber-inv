/** biome-ignore-all lint/suspicious/noExplicitAny: the strong types are on the signatures */
import { useEffect, useRef } from "react";
import type { Maybe } from "schema/utils";

export default function useOnceReady<T>(
  value: Maybe<T>,
  action: (v: T) => void,
) {
  const done = useRef(false);
  useEffect(() => {
    if (done.current || value == null) return;
    done.current = true;
    action(value);
  }, [value, action]);
}
