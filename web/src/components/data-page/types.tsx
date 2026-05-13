import type { ReactNode } from "react";
import type { Maybe } from "schema/utils";

export type DtFilter = {
  col: string;
  key: string;
  comp: () => React.ReactNode;
};

export type DtColumn<T> = {
  key: string;
  title: ReactNode;
  render: (t: T) => ReactNode;
  width?: string | number;
  onClick?: (t: T) => void;
  screen?: "mobile" | "normal" | "large" | "all";
  className?: string;
  filterToggle?: boolean;
};

export type SubsetCardsProps<T> = {
  items: { key: T; label: string }[];
  selected?: T;
  onSelect?: (key: T) => void;
  counts?: Record<T & string, Maybe<number>>;
};

export type DataTableProps<T> = {
  data?: Maybe<T[]>;
  columns?: DtColumn<T>[];
  filters?: DtFilter[];
  actions?: unknown;
  loading?: boolean;
  onMobile?: DtColumn<T>;
  onExport?: () => void;
  maxHeight?: string | number;
};
