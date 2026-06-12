import { message } from "antd";
import { m } from "i18n/messages";
import type { FtthSurveyT } from "schema/fhs";
import { type ApiPath, apiCall, useApiPost } from "#/api/helpers";
import type { ModalItemProps } from "#/hooks/useModalViewer";

export type FhsFormProps = ModalItemProps<FtthSurveyT>;

export function useFhsPost<I, O = FtthSurveyT>(path: ApiPath, tag = ["fhs"]) {
  return useApiPost<I, O>(path, tag);
}

export function useFhsUpdate<I extends { id: string }>(
  path: ApiPath,
  props: FhsFormProps,
  toast?: (a: { id: string }) => string,
) {
  const send = useApiPost<I, FtthSurveyT>(path, ["fhs"]);
  const onSubmit = apiCall(async (data: I) => {
    data.id = props.item.id;
    const { work } = await send.mutateAsync(data);
    message.success(toast ? toast({ id: work.sid }) : m.toast_sent());
    props.state.close();
  });
  return {
    onSubmit,
    state: props.state,
    submitting: send.isPending,
    subtitle: props.item.work.name,
  };
}
