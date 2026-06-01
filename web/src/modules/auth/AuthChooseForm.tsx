import { Button, Form, Radio } from "antd";
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
        title="Configuration MFA"
        subtitle="Choisissez votre mode d'authentification multifacteur"
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
                    title="Appli d'authentification"
                    caption="Utiliser une appli comme Google Authenticator"
                    smallCaption
                  />
                ),
              },
              {
                value: MfaMode.EMAIL,
                label: (
                  <WithCaption
                    title="E-mail"
                    caption="Recevez le code OTP par e-mail"
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
          Continuer
        </Button>

        <section className="mt-4 flex justify-end">
          <TextLink disabled={chooseQ.isPending} onClick={props.onCancel}>
            Cancel
          </TextLink>
        </section>
      </Form>
    </main>
  );
}
