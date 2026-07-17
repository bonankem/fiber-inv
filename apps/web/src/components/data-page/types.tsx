import type { ReactNode } from "react";
import type { Maybe } from "schema/utils";
import type { ModalItemFC, ModalViewer } from "#/hooks/useModalViewer";
import type { Actions } from "../actions/types";

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
  onClick?: ((t: T, m: ModalViewer) => void) | boolean;
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
  inModal?: boolean;
  columns?: DtColumn<T>[];
  filters?: DtFilter[];
  // biome-ignore lint/suspicious/noExplicitAny: only first type param is relevant
  actions?: Actions<T, any, any>;
  loading?: boolean;
  onMobile?: DtColumn<T>;
  onExport?: () => void;
  maxHeight?: string | number;
  modal?: ModalItemFC<T>;
  bordered?: boolean;
};
