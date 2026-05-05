import { Button, Form, Input } from "antd";
import TextLink from "#/components/TextLink";
import AuthHeader from "./AuthHeader";

export default function ResetPage() {
  return (
    <main>
      <AuthHeader
        title="Réinitialiser le mot de passe"
        subtitle="Saisissez l'adresse e-mail de votre compte"
      />

      <Form layout="vertical" onFinish={() => {}}>
        <Form.Item>
          <Input type="email" placeholder="E-mail" required />
        </Form.Item>

        <Button htmlType="submit" block type="primary">
          Envoyer
        </Button>

        <section className="mt-4 flex justify-end">
          <TextLink to="/login">← Retour à la page de connexion</TextLink>
        </section>
      </Form>
    </main>
  );
}
