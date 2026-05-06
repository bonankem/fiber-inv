import type { AuthResultT } from "schema/auth";

export type LoginFormProps<Extra = object> = Extra & {
  onResult?: (data: AuthResultT) => void;
  onCancel?: () => void;
};
