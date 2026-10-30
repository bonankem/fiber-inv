import { theme } from "antd";
import type { ReactNode } from "react";
import { twJoin } from "tailwind-merge";
import { type EmrfRow, emrfCollected, emrfTotal } from "./emrf-utils";

function Stat(props: { label: string; value: ReactNode; hint?: ReactNode }) {
  const { token } = theme.useToken();
  return (
    <div
      className="flex min-w-0 flex-col items-center gap-0.5 rounded-lg px-3 py-2 text-center"
      style={{
        background: token.colorFillQuaternary,
        border: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      <span className="text-xs" style={{ color: token.colorTextSecondary }}>
        {props.label}
      </span>
      <span className="truncate text-lg font-semibold tabular-nums leading-tight">
        {props.value}
      </span>
      {props.hint && (
        <span
          className="truncate text-xs"
          style={{ color: token.colorTextTertiary }}
        >
          {props.hint}
        </span>
      )}
    </div>
  );
}

type Props = {
  emrf: EmrfRow;
  /** Leave out the collected count, for a shorter strip in dialogs. */
  compact?: boolean;
};

/** Key numbers of a request at a glance. */
export default function EmrfStats({ emrf, compact }: Props) {
  const requested = emrfTotal(emrf);
  const collected = emrfCollected(emrf);
  const percent = requested ? Math.round((collected / requested) * 100) : 0;

  return (
    <div
      className={twJoin("grid gap-2", compact ? "grid-cols-2" : "grid-cols-3")}
    >
      <Stat label="Items" value={emrf.items.length} />
      <Stat label="Units requested" value={requested} />
      {!compact && (
        <Stat
          label="Units collected"
          value={collected}
          hint={`${percent}% of the request`}
        />
      )}
    </div>
  );
}
