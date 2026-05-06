import { useMutation } from "@tanstack/react-query";
import { Button, Form, Input } from "antd";
import type { OTPRef } from "antd/es/input/OTP";
import { type RefObject, useRef } from "react";
import type { AuthNeedsOtpT, AuthResultT, AuthVerifyReqT } from "schema/auth";
import { apiCall, postFn } from "#/api/helpers";
import TextLink from "#/components/TextLink";
import AuthHeader from "./AuthHeader";
import type { LoginFormProps } from "./utils";

type Props = LoginFormProps<{ res: AuthNeedsOtpT }>;

const prompts = {
  EMAIL: "Un code OTP vous a été envoyé par e-mail.",
  SMS: "Un code OTP vous a été envoyé par SMS.",
  WHATSAPP: "Un code OTP vous a été envoyé par WhatsApp.",
  AUTHENTICATOR: "Saisissez le code OTP de l'appli d'authentification.",
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

  const verifyQ = useMutation({
    mutationFn: postFn<AuthVerifyReqT, AuthResultT>("/auth/verify"),
  });

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
      <AuthHeader title="Saisir le code OTP" subtitle={prompts[mode]} />

      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item
          name="otp"
          rules={[
            { required: true, message: "Required", validateTrigger: "onBlur" },
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
          Vérifier le code OTP
        </Button>

        <section className="mt-4 flex justify-end">
          <TextLink onClick={() => props.onCancel?.()}>Cancel</TextLink>
        </section>
      </Form>
    </main>
  );
}
