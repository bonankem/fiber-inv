import { Tooltip } from "antd";
import type { CoordsT } from "schema/geo";
import type { Maybe } from "schema/utils";

export default function CoordsLink(props: { coords: Maybe<CoordsT> }) {
  const c = props.coords;
  if (!c) return undefined;

  const ns = c.lat >= 0 ? "N" : "S";
  const ew = c.lng >= 0 ? "E" : "W";
  const lat = Math.abs(c.lat).toFixed(5);
  const lng = Math.abs(c.lng).toFixed(5);
  const text = `${lat}°${ns}, ${lng}°${ew}`;
  const link = `https://www.google.com/maps/place/${c.lat},${c.lng}`;

  return (
    <Tooltip title="View on Google Maps">
      <a href={link} target="_blank" rel="noopener noreferrer">
        {text}
      </a>
    </Tooltip>
  );
}
