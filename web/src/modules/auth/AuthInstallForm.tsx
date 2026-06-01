import { Button, Form, Input, QRCode } from "antd";
import type { OTPRef } from "antd/es/input/OTP";
import { type RefObject, useRef } from "react";
import type {
  AuthNeedsInstallT,
  AuthResultT,
  AuthVerifyReqT,
} from "schema/auth";
import { MfaMode } from "schema/enums";
import { apiCall, useApiPost } from "#/api/helpers";
import TextLink from "#/components/TextLink";
import AuthHeader from "./AuthHeader";
import type { LoginFormProps } from "./utils";

type Props = LoginFormProps<{ res: AuthNeedsInstallT }>;

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

export default function AuthInstallForm(props: Props) {
  const { token } = props.res;
  const mode = MfaMode.AUTHENTICATOR;
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
      <AuthHeader
        title="Configurer l'appli d'authentification"
        subtitle="Scannez le code QR, puis saisissez le code OTP."
      />

      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <QRCode
          value={props.res.otpUri}
          className="w-full! h-auto! p-8! mb-4!"
          icon="/mtn-square.svg"
          //   iconSize={{ width: 96, height: 54 }}
        />

        <Form.Item
          label="Saissez le code OTP"
          name="otp"
          // no asterisk
          required={false}
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
