import { Button, Form, Input, Tooltip } from "antd";
import { m } from "i18n/messages";
import { type Locale, setLocale } from "i18n/runtime";
import type { AuthLoginReqT, AuthResultT } from "schema/auth";
import { apiCall, useApiPost } from "#/api/helpers";
import TextLink from "#/components/TextLink";
import AuthHeader from "./AuthHeader";
import type { LoginFormProps } from "./utils";

function Lang(props: { locale: Locale; abbr: string; name: string }) {
  return (
    <Tooltip title={props.name} trigger="hover" placement="bottom">
      <span>
        <TextLink onClick={() => setLocale(props.locale)}>
          {props.abbr}
        </TextLink>
      </span>
    </Tooltip>
  );
}

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

        <section className="flex justify-between gap-2 mt-4">
          <section className="flex gap-1">
            <Lang locale="en" abbr="EN" name="English" />/
            <Lang locale="fr" abbr="FR" name="Français" />
          </section>
          <TextLink to="/reset">{m.forgot_password()}</TextLink>
        </section>
      </Form>
    </main>
  );
}
