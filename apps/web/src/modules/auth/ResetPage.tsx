import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Button, Form, Input, message } from "antd";
import { m } from "i18n/messages";
import type {
  AuthResetReqT,
  AuthResetCheckReqT as Check,
  AuthResetCheckResT as CheckRes,
} from "schema/auth";
import { apiCall, postJson, useApiPost } from "#/api/helpers";
import TextLink from "#/components/TextLink";
import { usePasswordChecks } from "../session/utils";
import AuthHeader from "./AuthHeader";

export default function ResetPage({ code }: { code: string }) {
  const send = useApiPost<AuthResetReqT>("/auth/reset");
  const check = useQuery({
    queryFn: () => postJson<Check, CheckRes>("/auth/reset-check", { code }),
    queryKey: ["auth", "reset-check"],
    staleTime: 0,
  });

  type Input = {
    newPassword: string;
    confirm: string;
  };
  const [form] = Form.useForm<Input>();
  const checks = usePasswordChecks(form, check.data);
  const nav = useNavigate();

  const onSubmit = apiCall(async ({ newPassword }: Input) => {
    await send.mutateAsync({ newPassword, code });
    message.success(m.password_changed());
    nav({ to: "/login", replace: true });
  });

  return check.data?.valid === false ? (
    <main className="flex flex-col items-center gap-2">
      <p className="text-xl font-medium">{m.invalid_reset_link()}</p>
      <TextLink to="/login">← {m.back_to_login()}</TextLink>
    </main>
  ) : (
    <main>
      <AuthHeader title={m.reset_password()} />
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item
          name="newPassword"
          label={m.new_password()}
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
          loading={send.isPending}
          disabled={!checks.allOk}
        >
          {m.send()}
        </Button>

        <section className="mt-4 flex justify-end">
          <TextLink to="/login">← {m.back_to_login()}</TextLink>
        </section>
      </Form>
    </main>
  );
}
