import { Form } from "antd";
import { m } from "i18n/messages";
import type { SecurityT } from "schema/admin";
import FormModal from "#/components/FormModal";
import IntInput from "#/components/inputs/IntInput";
import type { ModalItemProps } from "#/hooks/useModalViewer";

export default function SecurityForm(props: ModalItemProps<SecurityT>) {
  const label = {
    labelCol: { span: 16 },
    labelAlign: "left",
  } as const;

  return (
    <FormModal
      state={props.state}
      title={m.sec_settings()}
      okText="Enregistrer"
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

      <Form.Item name="userInactiveDays" label={m.sec_new_accts()} {...label}>
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
