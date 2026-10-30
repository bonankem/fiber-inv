import { WarningOutlined } from "@ant-design/icons";
import { Tooltip, theme } from "antd";
import { filterTruthy } from "schema/utils";
import StatusBadge from "#/components/StatusBadge";
import EmrfStats from "../EmrfStats";
import {
  type EmrfRow,
  emrfSegments,
  emrfShortId,
  emrfVendor,
  formatDate,
  lineShortfall,
} from "../emrf-utils";

const PREVIEW_LINES = 4;

/** A recap of the request to check before acting on it. */
export default function EmrfSummary({ emrf }: { emrf: EmrfRow }) {
  const { token } = theme.useToken();
  const preview = emrf.items.slice(0, PREVIEW_LINES);
  const more = emrf.items.length - preview.length;
  const segments = emrfSegments(emrf);
  const facts = filterTruthy([
    emrfVendor(emrf),
    segments && `Segment ${segments}`,
    `Requested ${formatDate(emrf.createdAt)}`,
  ]);
  const box = {
    background: token.colorFillQuaternary,
    border: `1px solid ${token.colorBorderSecondary}`,
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1 rounded-lg px-4 py-2.5" style={box}>
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-sm font-semibold">
            EMRF {emrfShortId(emrf)}
          </span>
          <StatusBadge status={emrf.status} />
        </div>
        <span className="text-xs" style={{ color: token.colorTextSecondary }}>
          {facts.join(" · ")}
        </span>
      </div>

      <EmrfStats emrf={emrf} compact />

      <ul
        className="m-0 flex list-none flex-col rounded-lg p-0"
        style={{ border: `1px solid ${token.colorBorderSecondary}` }}
      >
        {preview.map((line, i) => {
          const short = lineShortfall(line);
          return (
            <li
              key={line.id}
              className="flex items-center justify-between gap-3 px-4! py-2"
              style={
                i ? { borderTop: `1px solid ${token.colorSplit}` } : undefined
              }
            >
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm">{line.equipment.name}</span>
                <span
                  className="font-mono text-xs"
                  style={{ color: token.colorTextTertiary }}
                >
                  {line.equipment.mtnCode}
                </span>
              </div>
              <span className="flex shrink-0 items-center gap-1.5 text-sm tabular-nums">
                {short > 0 && (
                  <Tooltip title={`Short by ${short}`}>
                    <WarningOutlined style={{ color: token.colorWarning }} />
                  </Tooltip>
                )}
                × {line.requestedQty}
              </span>
            </li>
          );
        })}
        {more > 0 && (
          <li
            className="px-4! py-1.5 text-xs"
            style={{
              borderTop: `1px solid ${token.colorSplit}`,
              color: token.colorTextTertiary,
            }}
          >
            and {more} more {more === 1 ? "item" : "items"}, listed in the
            details
          </li>
        )}
      </ul>
    </div>
  );
}
