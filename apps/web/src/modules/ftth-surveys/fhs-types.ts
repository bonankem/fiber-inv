import { message } from "antd";
import { m } from "i18n/messages";
import type { FtthSurveyT } from "schema/fhs";
import { type ApiPath, apiCall, showAppError, useApiPost } from "#/api/helpers";
import type { ModalItemProps } from "#/hooks/useModalViewer";

export type FhsFormProps = ModalItemProps<FtthSurveyT>;

export function useFhsPost<I, O = FtthSurveyT>(path: ApiPath) {
  return useApiPost<I, O>(path);
}

export function useFhsUpdate<I extends { id: string }>(
  path: ApiPath,
  props: FhsFormProps,
  toast?: (a: { id: string }) => string,
  precheck?: (data: I) => boolean | string,
) {
  const send = useApiPost<I, FtthSurveyT>(path);

  const onSubmit = apiCall(async (data: I) => {
    data.id = props.item.id;
    if (precheck) {
      try {
        const check = precheck(data);
        if (check !== true) {
          if (check) showAppError(check);
          return; // check failed
        }
      } catch (e) {
        showAppError(e);
        return;
      }
    }
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
