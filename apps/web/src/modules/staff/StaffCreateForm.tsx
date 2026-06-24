import { Alert, Form, Input, message, Select } from "antd";
import { m } from "i18n/messages";
import { StaffRole } from "schema/enums";
import { type UserCreateT, type UserFullT, userZ } from "schema/people";
import { zArray } from "schema/utils";
import { apiCall, useApiGet, useApiPost } from "#/api/helpers";
import FormModal from "#/components/FormModal";
import type { ModalStateProps } from "#/hooks/useModalViewer";
import { selectProps } from "#/utils/select";
import { staffRoleName } from "./utils";

type Data = UserCreateT & { type: string };

export default function StaffCreateForm(props: ModalStateProps) {
  const usersQ = useApiGet("/users", zArray(userZ));
  const emails = usersQ.data?.map((u) => u.email.toLowerCase()) ?? [];
  const checker = async (email: string) => {
    if (emails.includes(email.toLowerCase().trim())) {
      throw new Error(m.email_exists());
    }
  };

  const [form] = Form.useForm<Data>();
  const type = Form.useWatch("type", form);
  const send = useApiPost<UserCreateT, UserFullT>("/users", "all");

  const onSubmit = apiCall(async (data: Data) => {
    const { type, ...out } = data;
    if (type === "Admin") out.isAdmin = true;
    const result = await send.mutateAsync(out);
    message.success(`Added ${result.name}`);
    props.state.close();
  });

  return (
    <FormModal
      form={form}
      state={props.state}
      title={m.add_staff()}
      onSubmit={onSubmit}
    >
      <Form.Item
        name="email"
        label={m.email()}
        required
        rules={[{ validator: (_, v) => checker(v) }]}
      >
        <Input type="email" required />
      </Form.Item>

      <Form.Item name="name" label={m.name()} required>
        <Input type="name" required />
      </Form.Item>

      <Form.Item name="type" label={m.type()} required>
        <Select {...selectProps(["Staff", "Vendor", "Admin"])} />
      </Form.Item>

      {type === "Staff" && (
        <Form.Item label={m.role()} name="staffRole">
          <Select
            options={Object.values(StaffRole).map((value) => ({
              label: staffRoleName(value),
              value,
            }))}
          />
        </Form.Item>
      )}

      {type && <Alert showIcon title={m.login_will_be_sent()} />}
    </FormModal>
  );
}
