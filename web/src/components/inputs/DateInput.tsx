import { DatePicker } from "antd";
import dayjs from "dayjs";
import { useMemo } from "react";
import type { Maybe } from "schema/utils";

type Props = {
  value?: Maybe<dayjs.ConfigType>;
  onChange?: (d: string | null) => void;
};

export default function DateInput(props: Props) {
  const value = useMemo(() => {
    return props.value ? dayjs(props.value) : null;
  }, [props.value]);

  return (
    <DatePicker
      className="w-full"
      value={value}
      onChange={(_, d) => props.onChange?.(d)}
    />
  );
}
