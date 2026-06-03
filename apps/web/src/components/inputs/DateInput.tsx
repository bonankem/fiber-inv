import { DatePicker } from "antd";
import dayjs from "dayjs";
import type { Maybe } from "schema/utils";

type DateValue = Maybe<dayjs.ConfigType>;

function maybeDate(d: DateValue) {
  return d ? dayjs(d) : undefined;
}

type Props = {
  value?: DateValue;
  minDate?: DateValue;
  maxDate?: DateValue;
  onChange?: (d: string | null) => void;
};

export default function DateInput(props: Props) {
  return (
    <DatePicker
      className="w-full"
      value={maybeDate(props.value)}
      minDate={maybeDate(props.minDate)}
      maxDate={maybeDate(props.maxDate)}
      onChange={(_, d) => props.onChange?.(d)}
    />
  );
}
