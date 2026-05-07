import type { PropsWithChildren } from "react";
import { UploaderContext, useUploaderImpl } from "#/hooks/useUploader";

export default function UploaderProvider(props: PropsWithChildren) {
  return (
    <UploaderContext value={useUploaderImpl()}>
      {props.children}
    </UploaderContext>
  );
}
