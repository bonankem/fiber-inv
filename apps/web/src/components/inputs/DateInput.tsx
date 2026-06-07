import { DatePicker } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import type { Maybe } from "schema/utils";

type DateValue = Maybe<dayjs.ConfigType>;

function maybeDate(d: DateValue) {
  return d ? dayjs(d, ["YYYY-MM-DD", "DD MMM YYYY"]) : undefined;
}

type Props = {
  value?: DateValue;
  minDate?: DateValue;
  maxDate?: DateValue;
  onChange?: (d: string | null) => void;
};

export default function DateInput(props: Props) {
  const change = (d: Dayjs | null) => {
    props.onChange?.(d?.format("YYYY-MM-DD") || null);
  };
  return (
    <DatePicker
      className="w-full"
      value={maybeDate(props.value)}
      minDate={maybeDate(props.minDate)}
      maxDate={maybeDate(props.maxDate)}
      onChange={change}
      format="DD MMM YYYY"
    />
  );
}
