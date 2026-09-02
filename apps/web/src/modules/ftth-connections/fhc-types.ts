import { m } from "i18n/messages";
import { FhcMode } from "schema/enums";
import type { FtthConnectionT } from "schema/fhc";
import type { ModalItemProps } from "#/hooks/useModalViewer";

export type FhcFormProps = ModalItemProps<FtthConnectionT>;

export const fhcModeNames: Record<FhcMode, string> = {
  [FhcMode.CABLED_BUILDING]: m.cabled_building(),
  [FhcMode.PRECONNECTORIZED]: m.preconnectorized(),
  [FhcMode.TRADITIONAL]: m.traditional(),
};

export const fhcModeSelect = Object.entries(fhcModeNames).map(
  ([value, label]) => ({ value: value as FhcMode, label }),
);

export const yesNoSelect = [
  { value: true, label: m.yes() },
  { value: false, label: m.no() },
];
