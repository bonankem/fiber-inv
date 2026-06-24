import { Form, message } from "antd";
import { m } from "i18n/messages";
import { useEffect, useState } from "react";
import { type SecurityT, securityZ } from "schema/admin";
import { apiCall, useApiGet, useApiPost } from "#/api/helpers";
import FormModal from "#/components/FormModal";
import IntInput from "#/components/inputs/IntInput";
import type { ModalItemProps } from "#/hooks/useModalViewer";

export default function SecurityForm(props: ModalItemProps<SecurityT>) {
  const [form] = Form.useForm<SecurityT>();
  const query = useApiGet<SecurityT>("/admin/security", securityZ);
  const send = useApiPost<SecurityT>("/admin/security", ["admin"]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (query.data && !ready) {
      form.setFieldsValue(query.data);
      setReady(true);
    }
  }, [ready, query.data, form]);

  const onSubmit = apiCall(async (data: SecurityT) => {
    await send.mutateAsync(data);
    message.success(m.saved());
    props.state.close();
  });

  const label = {
    labelCol: { span: 16 },
    labelAlign: "left",
  } as const;

  return (
    <FormModal
      width={400}
      state={props.state}
      title={m.sec_settings()}
      onSubmit={onSubmit}
      okText={m.save()}
      checkbox={false}
      layout="horizontal"
      initialValues={props.item}
    >
      <h3 className="font-bold">{m.sec_inactivity()}</h3>

      <Form.Item name="userInactiveDays" label={m.sec_users()} {...label}>
        <IntInput controls={false} suffix={m.days()} />
      </Form.Item>

      <Form.Item name="adminInactiveDays" label={m.sec_admins()} {...label}>
        <IntInput controls={false} suffix={m.days()} />
      </Form.Item>

      <Form.Item name="newInactiveDays" label={m.sec_new_accts()} {...label}>
        <IntInput controls={false} suffix={m.days()} />
      </Form.Item>

      <Form.Item
        name="inactiveLockDays"
        label={m.sec_remove_expired()}
        {...label}
      >
        <IntInput controls={false} suffix={m.days()} />
      </Form.Item>

      <h3 className="font-bold">{m.sec_lockout()}</h3>

      <Form.Item
        name="lockoutAttempts"
        label={m.sec_failed_attempts()}
        {...label}
      >
        <IntInput controls={false} />
      </Form.Item>

      <Form.Item
        name="lockoutMinutes"
        label={m.sec_lockout_minutes()}
        {...label}
      >
        <IntInput controls={false} />
      </Form.Item>
    </FormModal>
  );
}
