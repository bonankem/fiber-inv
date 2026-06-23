import { Form, Input, message } from "antd";
import { m } from "i18n/messages";
import { useState } from "react";
import { omit } from "remeda";
import { MfaMode } from "schema/enums";
import { userFullZ } from "schema/people";
import type {
  SessionPasswordReqT as Req,
  SessionPasswordResT as Res,
} from "schema/session";
import { apiCall, useApiGet, useApiPost } from "#/api/helpers";
import FormModal from "#/components/FormModal";
import OtpInput from "#/components/inputs/OtpInput";
import type { ModalStateProps } from "#/hooks/useModalViewer";
import { usePasswordChecks } from "./utils";

const { NONE } = MfaMode;

export default function PasswordModal(props: ModalStateProps) {
  const changeQ = useApiPost<Req, Res>("/session/password");
  const user = useApiGet("session/user", userFullZ);

  type Input = Req & { confirm: string };
  const [form] = Form.useForm<Input>();
  const checks = usePasswordChecks(form, user.data);
  const [needsOtp, setNeedsOtp] = useState<MfaMode>(NONE);

  const onSubmit = apiCall(async (input: Input) => {
    const dto = omit(input, ["confirm"]);
    const result = await changeQ.mutateAsync(dto);
    if (result.needsOtp === NONE) {
      message.success(m.password_changed());
      return props.state.close();
    }
    setNeedsOtp(result.needsOtp);
  });

  return (
    <FormModal
      form={form}
      state={props.state}
      title={m.change_password()}
      onSubmit={onSubmit}
    >
      <Form.Item name="oldPassword" label={m.current_password()}>
        <Input.Password required />
      </Form.Item>

      <Form.Item
        name="newPassword"
        label={m.new_password()}
        dependencies={["oldPassword"]}
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

      {needsOtp !== NONE && (
        <Form.Item
          name="otp"
          label="OTP"
          validateTrigger="onBlur"
          rules={[{ required: true }, { len: 6 }]}
        >
          <OtpInput />
        </Form.Item>
      )}
    </FormModal>
  );
}
