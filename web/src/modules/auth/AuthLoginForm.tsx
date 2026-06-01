import { Button, Form, Input } from "antd";
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
      <AuthHeader title="Connectez-vous à ServiceX" />

      <Form layout="vertical" onFinish={onSubmit}>
        <Form.Item name="email">
          <Input type="email" placeholder="E-mail" required />
        </Form.Item>

        <Form.Item name="password">
          <Input.Password placeholder="Mot de passe" required />
        </Form.Item>

        <Button
          block
          type="primary"
          htmlType="submit"
          loading={loginQ.isPending}
        >
          Se connecter
        </Button>

        <section className="mt-4 flex justify-end">
          <TextLink to="/reset">Mot de passe oublié?</TextLink>
        </section>
      </Form>
    </main>
  );
}
