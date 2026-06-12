import { Button, Form, Input } from "antd";
import { m } from "i18n/messages";
import type { AuthLoginReqT, AuthResultT } from "schema/auth";
import { apiCall, useApiPost } from "#/api/helpers";
import TextLink from "#/components/TextLink";
import AuthHeader from "./AuthHeader";
import type { LoginFormProps } from "./utils";

export default function AuthLoginForm(props: LoginFormProps) {
  const loginQ = useApiPost<AuthLoginReqT, AuthResultT>("/auth/login");

  const onSubmit = apiCall(async (data: AuthLoginReqT) => {
    props.onResult?.(await loginQ.mutateAsync(data));
  });

  return (
    <main>
      <AuthHeader title={m.login_title()} />

      <Form layout="vertical" onFinish={onSubmit}>
        <Form.Item name="email">
          <Input type="email" placeholder={m.email()} required />
        </Form.Item>

        <Form.Item name="password">
          <Input.Password placeholder={m.password()} required />
        </Form.Item>

        <Button
          block
          type="primary"
          htmlType="submit"
          loading={loginQ.isPending}
        >
          {m.login()}
        </Button>

        <section className="mt-4 flex justify-end">
          <TextLink to="/reset">{m.forgot_password()}</TextLink>
        </section>
      </Form>
    </main>
  );
}
