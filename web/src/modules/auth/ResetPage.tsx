import { Button, Form, Input } from "antd";
import { m } from "i18n/messages";
import TextLink from "#/components/TextLink";
import AuthHeader from "./AuthHeader";

export default function ResetPage() {
  return (
    <main>
      <AuthHeader title={m.reset_password()} subtitle={m.reset_pw_caption()} />

      <Form layout="vertical" onFinish={() => {}}>
        <Form.Item>
          <Input type="email" placeholder={m.email()} required />
        </Form.Item>

        <Button htmlType="submit" block type="primary">
          {m.send()}
        </Button>

        <section className="mt-4 flex justify-end">
          <TextLink to="/login">← {m.back_to_login()}</TextLink>
        </section>
      </Form>
    </main>
  );
}
