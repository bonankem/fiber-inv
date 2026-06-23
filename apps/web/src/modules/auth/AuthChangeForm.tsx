import { Button, Form, Input, message } from "antd";
import { m } from "i18n/messages";
import {
  type AuthChangeReqT,
  type AuthNeedsChangeT,
  type AuthResultT,
  AuthStatus,
} from "schema/auth";
import { apiCall, useApiPost } from "#/api/helpers";
import TextLink from "#/components/TextLink";
import { usePasswordChecks } from "../session/utils";
import AuthHeader from "./AuthHeader";
import type { LoginFormProps } from "./utils";

type Props = LoginFormProps<{ res: AuthNeedsChangeT }>;

export default function AuthChangeForm(props: Props) {
  const changeQ = useApiPost<AuthChangeReqT, AuthResultT>("/auth/change");

  type Input = {
    oldPassword: string;
    newPassword: string;
    confirm: string;
  };
  const [form] = Form.useForm<Input>();
  const checks = usePasswordChecks(form, props.res);

  const onSubmit = apiCall(async (input: Input) => {
    const result = await changeQ.mutateAsync({
      token: props.res.token,
      oldPassword: input.oldPassword,
      newPassword: input.newPassword,
    });
    if (result.status !== AuthStatus.SUCCESS) {
      message.success(m.password_changed());
    }
    props.onResult?.(result);
  });

  return (
    <main>
      <AuthHeader title={m.change_password()} />

      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item name="oldPassword" label={m.current_password()}>
          <Input.Password required />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label={m.new_password()}
          dependencies={["oldPassword"]}
          rules={[checks.newPassRule]}
        >
          <Input.Password
            required
            visibilityToggle={checks.visibilityToggle}
            placeholder={m.new_password_hint()}
          />
        </Form.Item>

        <Form.Item
          name="confirm"
          dependencies={["newPassword"]}
          rules={[checks.confirmRule]}
        >
          <Input.Password
            required
            visibilityToggle={checks.visibilityToggle}
            placeholder={m.confirm_new_password()}
          />
        </Form.Item>

        {checks.render()}

        <Button
          block
          type="primary"
          htmlType="submit"
          loading={changeQ.isPending}
          disabled={!checks.allOk}
        >
          {m.send()}
        </Button>

        <section className="mt-4 flex justify-end">
          <TextLink disabled={changeQ.isPending} onClick={props.onCancel}>
            {m.back()}
          </TextLink>
        </section>
      </Form>
    </main>
  );
}
