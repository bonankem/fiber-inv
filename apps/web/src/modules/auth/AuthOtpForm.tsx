import { Button, Form } from "antd";
import type { OTPRef } from "antd/es/input/OTP";
import { m } from "i18n/messages";
import { useRef } from "react";
import type { AuthNeedsOtpT, AuthResultT, AuthVerifyReqT } from "schema/auth";
import { apiCall, useApiPost } from "#/api/helpers";
import OtpInput from "#/components/inputs/OtpInput";
import TextLink from "#/components/TextLink";
import AuthHeader from "./AuthHeader";
import type { LoginFormProps } from "./utils";

type Props = LoginFormProps<{ res: AuthNeedsOtpT }>;

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
      <AuthHeader title={m.mfa_enter_otp()} subtitle={OtpInput.prompts[mode]} />

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
