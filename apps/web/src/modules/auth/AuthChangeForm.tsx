import { CheckCircleFilled, CloseCircleFilled } from "@ant-design/icons";
import { Button, Form, Input, message } from "antd";
import { m } from "i18n/messages";
import { useState } from "react";
import {
  type AuthChangeReqT,
  type AuthNeedsChangeT,
  type AuthResultT,
  AuthStatus,
} from "schema/auth";
import { apiCall, useApiPost } from "#/api/helpers";
import TextLink from "#/components/TextLink";
import AuthHeader from "./AuthHeader";
import type { LoginFormProps } from "./utils";

type Props = LoginFormProps<{ res: AuthNeedsChangeT }>;

function req(label: string, ok: (p: string) => boolean) {
  return { label, ok };
}

const reqs = [
  req(m.pw_min_length({ min: 6 }), (p) => p.length >= 6),
  req(m.pw_uppercase(), (p) => /[A-Z]/.test(p)),
  req(m.pw_lowercase(), (p) => /[a-z]/.test(p)),
  req(m.pw_number(), (p) => /[0-9]/.test(p)),
  req(m.pw_symbol(), (p) => /[\W_]/.test(p)),
];

export default function AuthChangeForm(props: Props) {
  const changeQ = useApiPost<AuthChangeReqT, AuthResultT>("/auth/change");

  type Input = { password: string; newPassword: string; confirm: string };
  const [form] = Form.useForm<Input>();
  const [showNew, setShowNew] = useState(false);
  const visibilityToggle = {
    visible: showNew,
    onVisibleChange: setShowNew,
  };

  const newPass = Form.useWatch("newPassword", form) || "";
  const checks = reqs.map((r) => ({ label: r.label, ok: r.ok(newPass) }));

  const allOk = checks.every((c) => c.ok);
  console.log(newPass);

  const onSubmit = apiCall(async (input: Input) => {
    const result = await changeQ.mutateAsync({
      token: props.res.token,
      password: input.password,
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
        <Form.Item name="password" label={m.current_password()}>
          <Input.Password required />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label={m.new_password()}
          dependencies={["password"]}
          rules={[
            (form) => ({
              async validator(_, value) {
                if (value && value === form.getFieldValue("password")) {
                  throw new Error(m.error_same_password());
                }
              },
            }),
          ]}
        >
          <Input.Password
            required
            visibilityToggle={visibilityToggle}
            placeholder={m.new_password_hint()}
          />
        </Form.Item>

        <Form.Item
          name="confirm"
          dependencies={["newPassword"]}
          rules={[
            (form) => ({
              async validator(_, value) {
                if (value && value !== form.getFieldValue("newPassword")) {
                  throw new Error(m.error_password_mismatch());
                }
              },
            }),
          ]}
        >
          <Input.Password
            required
            visibilityToggle={visibilityToggle}
            placeholder={m.confirm_new_password()}
          />
        </Form.Item>

        {!!newPass && (
          <Form.Item>
            <ul>
              {checks.map((c, i) => {
                return (
                  // biome-ignore lint/suspicious/noArrayIndexKey: index is the key
                  <li key={i}>
                    {c.ok ? (
                      <CheckCircleFilled className="text-green-500! mr-3" />
                    ) : (
                      <CloseCircleFilled className="text-red-500! mr-3" />
                    )}
                    <span>{c.label}</span>
                  </li>
                );
              })}
            </ul>
          </Form.Item>
        )}

        <Button
          block
          type="primary"
          htmlType="submit"
          loading={changeQ.isPending}
          disabled={!allOk}
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
