import { Button, Form, Radio } from "antd";
import { m } from "i18n/messages";
import type {
  AuthChooseReqT,
  AuthNeedsMfaModeT,
  AuthResultT,
} from "schema/auth";
import { MfaMode } from "schema/enums";
import { apiCall, useApiPost } from "#/api/helpers";
import TextLink from "#/components/TextLink";
import WithCaption from "#/components/WithCaption";
import AuthHeader from "./AuthHeader";
import type { LoginFormProps } from "./utils";

type Props = LoginFormProps<{ res: AuthNeedsMfaModeT }>;

export default function AuthChooseForm(props: Props) {
  const chooseQ = useApiPost<AuthChooseReqT, AuthResultT>("/auth/choose");

  const onSubmit = apiCall(async (input: Omit<AuthChooseReqT, "token">) => {
    const data = { ...input, token: props.res.token };
    props.onResult?.(await chooseQ.mutateAsync(data));
  });

  return (
    <main>
      <AuthHeader
        title={m.mfa_config_title()}
        subtitle={m.mfa_choose_message()}
      />

      <Form layout="vertical" onFinish={onSubmit}>
        <Form.Item name="mode">
          <Radio.Group
            size="large"
            orientation="vertical"
            options={[
              {
                value: MfaMode.AUTHENTICATOR,
                label: (
                  <WithCaption
                    title={m.mfa_app()}
                    caption={m.mfa_app_caption()}
                    smallCaption
                  />
                ),
              },
              {
                value: MfaMode.EMAIL,
                label: (
                  <WithCaption
                    title={m.email()}
                    caption={m.mfa_email_caption()}
                    smallCaption
                  />
                ),
              },
            ]}
          />
        </Form.Item>

        <Button
          block
          type="primary"
          htmlType="submit"
          loading={chooseQ.isPending}
        >
          {m.continue()}
        </Button>

        <section className="mt-4 flex justify-end">
          <TextLink disabled={chooseQ.isPending} onClick={props.onCancel}>
            {m.back()}
          </TextLink>
        </section>
      </Form>
    </main>
  );
}
