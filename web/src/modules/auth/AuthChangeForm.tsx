import { CheckCircleFilled, CloseCircleFilled } from "@ant-design/icons";
import { Button, Form, Input, message } from "antd";
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
  req("Au moins 6 caractères", (p) => p.length >= 6),
  req("Lettre majuscule (A-Z)", (p) => /[A-Z]/.test(p)),
  req("Lettre miniscule (a-z)", (p) => /[a-z]/.test(p)),
  req("Chiffre (0-9)", (p) => /[0-9]/.test(p)),
  req("Symbole", (p) => /[\W_]/.test(p)),
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
      message.success("Password changed successfully");
    }
    props.onResult?.(result);
  });

  return (
    <main>
      <AuthHeader title="Changer le mot de passe" />

      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item name="password" label="Mot de passe actuel">
          <Input.Password required />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label="Mot de passe nouveau"
          dependencies={["password"]}
          rules={[
            (form) => ({
              async validator(_, value) {
                if (value && value === form.getFieldValue("password")) {
                  throw new Error("N'utilisez pas le même mot de passe");
                }
              },
            }),
          ]}
        >
          <Input.Password
            required
            visibilityToggle={visibilityToggle}
            placeholder="Choisissez un nouveau mot de passe"
          />
        </Form.Item>

        <Form.Item
          name="confirm"
          dependencies={["newPassword"]}
          rules={[
            (form) => ({
              async validator(_, value) {
                if (value && value !== form.getFieldValue("newPassword")) {
                  throw new Error("Les mots de passe ne correspondent pas");
                }
              },
            }),
          ]}
        >
          <Input.Password
            required
            visibilityToggle={visibilityToggle}
            placeholder="Confirmer le nouveau mot de passe"
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
          Envoyer
        </Button>

        <section className="mt-4 flex justify-end">
          <TextLink disabled={changeQ.isPending} onClick={props.onCancel}>
            Cancel
          </TextLink>
        </section>
      </Form>
    </main>
  );
}
