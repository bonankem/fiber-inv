import { Button, Form, Input } from "antd";
import type { OTPRef } from "antd/es/input/OTP";
import { m } from "i18n/messages";
import { type RefObject, useRef } from "react";
import type { AuthNeedsOtpT, AuthResultT, AuthVerifyReqT } from "schema/auth";
import { apiCall, useApiPost } from "#/api/helpers";
import TextLink from "#/components/TextLink";
import AuthHeader from "./AuthHeader";
import type { LoginFormProps } from "./utils";

type Props = LoginFormProps<{ res: AuthNeedsOtpT }>;

const prompts = {
  EMAIL: m.mfa_prompt_email(),
  SMS: m.mfa_prompt_sms(),
  WHATSAPP: m.mfa_prompt_whatsapp(),
  AUTHENTICATOR: m.mfa_prompt_app(),
};

const noop = (_: unknown) => {};

function OtpInput(props: {
  value?: string;
  onChange?: (s: string) => void;
  ref: RefObject<OTPRef | null>;
}) {
  const onChange = props.onChange || noop;
  return (
    <Input.OTP
      ref={props.ref}
      size="large"
      length={6}
      value={props.value || ""}
      inputMode="numeric"
      formatter={(s) => s.replace(/\D/g, "")}
      onInput={(v) => onChange(v.join(""))}
      onChange={onChange}
    />
  );
}

export default function AuthOtpForm(props: Props) {
  const { mode, token } = props.res;
  const [form] = Form.useForm<AuthVerifyReqT>();
  const ref = useRef<OTPRef>(null);

  const verifyQ = useApiPost<AuthVerifyReqT, AuthResultT>("/auth/verify");

  const reset = () => {
    form.resetFields();
    setTimeout(() => ref.current?.focus(), 100);
  };

  const onSubmit = apiCall(async ({ otp }: { otp: string }) => {
    const data = { otp, mode, token };
    const result = verifyQ.mutateAsync(data);
    props.onResult?.(await result.finally(reset));
  });

  return (
    <main>
      <AuthHeader title={m.mfa_enter_otp()} subtitle={prompts[mode]} />

      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item
          name="otp"
          rules={[
            {
              required: true,
              message: m.required(),
              validateTrigger: "onBlur",
            },
            { len: 6, validateTrigger: "onBlur" },
          ]}
        >
          <OtpInput ref={ref} />
        </Form.Item>

        <Button
          block
          type="primary"
          htmlType="submit"
          loading={verifyQ.isPending}
        >
          {m.mfa_verify_otp()}
        </Button>

        <section className="mt-4 flex justify-end">
          <TextLink onClick={() => props.onCancel?.()}>{m.back()}</TextLink>
        </section>
      </Form>
    </main>
  );
}
