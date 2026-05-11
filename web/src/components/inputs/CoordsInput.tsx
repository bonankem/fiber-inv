import {
  InputNumber,
  type InputNumberProps,
  type InputProps,
  Space,
} from "antd";
import type { CoordsT } from "schema/geo";
import type { Maybe } from "schema/utils";

type CoordsInputValue = {
  lat: number | null;
  lng: number | null;
};

type Props = {
  value?: Maybe<CoordsInputValue>;
  onChange?: (c: CoordsInputValue | undefined) => void;
  required?: boolean;
  size?: InputProps["size"];
  className?: string;
  allowClear?: boolean;
};

const DMS =
  /^\s*(\d+\.?\d*)°(?:(\d+\.?\d*)')?(?:(\d+\.?\d*)")?([NS])[, ]*(\d+\.?\d*)°(?:(\d+\.?\d*)')?(?:(\d+\.?\d*)")?([EW])\s*$/;
const DD = /^\s*([-+]?\d+\.?\d*)[, ]+([-+]?\d+\.?\d*)\s*$/;

function to5dp(n: number) {
  return Math.round(n * 100000) / 100000;
}

function parseCoords(text: string): CoordsT | null {
  const dd = DD.exec(text);
  if (dd) {
    const lat = Number(dd[1]);
    const lng = Number(dd[2]);
    if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
      return { lat: to5dp(lat), lng: to5dp(lng) };
    }
  }

  const dms = DMS.exec(text);
  if (dms) {
    const d1 = Number(dms[1]) || 0;
    const m1 = Number(dms[2]) || 0;
    const s1 = Number(dms[3]) || 0;
    const ns = dms[4] === "N" ? 1 : -1;

    const d2 = Number(dms[5]) || 0;
    const m2 = Number(dms[6]) || 0;
    const s2 = Number(dms[7]) || 0;
    const ew = dms[8] === "E" ? 1 : -1;

    const lat = (d1 + m1 / 60 + s1 / 3600) * ns;
    const lng = (d2 + m2 / 60 + s2 / 3600) * ew;
    if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
      return { lat: to5dp(lat), lng: to5dp(lng) };
    }
  }

  return null;
}

export default function CoordsInput(props: Props) {
  const lat = props.value?.lat || null;
  const lng = props.value?.lng || null;

  const set = (lat: number | null, lng: number | null) => {
    props.onChange?.(lat || lng ? { lat, lng } : undefined);
  };

  const hasLat = typeof lat === "number";
  const hasLng = typeof lng === "number";
  const incomplete = hasLat !== hasLng;
  const inputProps = (title: string, max: number) =>
    ({
      precision: 5,
      min: -max,
      max,
      title,
      placeholder: title,
      controls: false,
      size: props.size,
      required: props.required || incomplete,
      className: "basis-1 grow",
      onPaste(e) {
        const text = e.clipboardData?.getData("Text");
        const data = text ? parseCoords(text) : null;
        if (data && props.onChange) {
          e.preventDefault();
          props.onChange(data);
        }
      },
    }) satisfies InputNumberProps;

  return (
    <Space.Compact block>
      <InputNumber
        value={lat}
        onChange={(lat) => set(lat, lng)}
        {...inputProps("Latitude", 90)}
      />
      <InputNumber
        value={lng}
        onChange={(lng) => set(lat, lng)}
        {...inputProps("Longitude", 180)}
      />
    </Space.Compact>
  );
}
