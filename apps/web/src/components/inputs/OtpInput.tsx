import { Input } from "antd";
import type { OTPRef } from "antd/es/input/OTP";
import { m } from "i18n/messages";
import type { RefObject } from "react";

export default function OtpInput(props: {
  value?: string;
  onChange?: (s: string) => void;
  ref?: RefObject<OTPRef | null>;
}) {
  const onChange = props.onChange || (() => {});
  return (
    <Input.OTP
      className="w-full!"
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

OtpInput.prompts = {
  EMAIL: m.mfa_prompt_email(),
  SMS: m.mfa_prompt_sms(),
  WHATSAPP: m.mfa_prompt_whatsapp(),
  AUTHENTICATOR: m.mfa_prompt_app(),
};
