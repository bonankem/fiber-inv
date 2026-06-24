import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { useNavigate } from "@tanstack/react-router";
import { Button, Form, Input, message } from "antd";
import { m } from "i18n/messages";
import { getLocale } from "i18n/runtime";
import { useRef, useState } from "react";
import type { AuthForgotReqT } from "schema/auth";
import { apiCall, useApiPost } from "#/api/helpers";
import TextLink from "#/components/TextLink";
import { useAppTheme } from "#/theme";
import AuthHeader from "./AuthHeader";

const tKey = import.meta.env.VITE_TURNSTILE_KEY;

export default function ForgotPage() {
  const [turnstile, setTurnstile] = useState<string>();
  const tRef = useRef<TurnstileInstance | null>(null);
  const send = useApiPost<AuthForgotReqT>("/auth/forgot");
  const nav = useNavigate();
  const { isDark } = useAppTheme();

  const onSubmit = apiCall(async (data: AuthForgotReqT) => {
    data.turnstile = turnstile;
    await send.mutateAsync(data).finally(() => {
      tRef.current?.reset();
    });
    nav({ to: "/login" });
    message.info(m.reset_link_sent());
  });

  return (
    <main>
      <AuthHeader title={m.reset_password()} subtitle={m.reset_pw_caption()} />

      <Form layout="vertical" onFinish={onSubmit} className="overflow-hidden!">
        <Form.Item name="email">
          <Input type="email" placeholder={m.email()} required />
        </Form.Item>

        {tKey && (
          <Turnstile
            className="mb-4 bg-gray-50 rounded-sm"
            siteKey={tKey}
            options={{
              size: "flexible",
              theme: isDark ? "dark" : "light",
              language: getLocale(),
            }}
            onSuccess={(t) => setTurnstile(t)}
            onExpire={() => setTurnstile(undefined)}
            onError={() => setTurnstile(undefined)}
          />
        )}

        <Button
          htmlType="submit"
          block
          type="primary"
          loading={send.isPending}
          disabled={!!tKey && !turnstile}
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
