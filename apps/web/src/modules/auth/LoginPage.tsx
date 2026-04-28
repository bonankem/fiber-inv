import { useNavigate } from "@tanstack/react-router";
import { Button, Form, Input } from "antd";
import TextLink from "#/components/TextLink";
import AuthHeader from "./AuthHeader";

export default function LoginPage() {
  const navigate = useNavigate();
  const onSubmit = () => {
    navigate({ to: "/ftth-surveys" });
  };
  return (
    <main>
      <AuthHeader title="Connectez-vous à ServiceX" />

      <Form layout="vertical" onFinish={onSubmit}>
        <Form.Item>
          <Input type="email" placeholder="E-mail" required />
        </Form.Item>

        <Form.Item>
          <Input.Password placeholder="Mot de passe" required />
        </Form.Item>

        <Button htmlType="submit" block type="primary">
          Se connecter
        </Button>

        <section className="mt-4 flex justify-end">
          <TextLink to="/reset">Mot de passe oublié?</TextLink>
        </section>
      </Form>
    </main>
  );
}
