import { Descriptions, message } from "antd";
import { m } from "i18n/messages";
import type { UserT } from "schema/people";
import { apiCall, useApiPost } from "#/api/helpers";
import FormModal from "#/components/FormModal";
import type { ModalItemProps } from "#/hooks/useModalViewer";

export default function UnlockForm(props: ModalItemProps<UserT>) {
  const send = useApiPost<{ id: string }>("/admin/unlock");
  const user = props.item;

  const onSubmit = apiCall(async () => {
    await send.mutateAsync({ id: user.id });
    message.success("Unlocked");
    props.state.close();
  });

  return (
    <FormModal
      state={props.state}
      title="Unlock Account"
      okText="Unlock"
      onSubmit={onSubmit}
      submitting={send.isPending}
    >
      <Descriptions
        column={1}
        items={[
          { key: "name", label: m.name(), children: user.name },
          { key: "email", label: m.email(), children: user.email },
        ]}
      />
    </FormModal>
  );
}
