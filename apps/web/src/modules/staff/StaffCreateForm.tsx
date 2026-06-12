import { Form, Input } from "antd";
import FormModal from "#/components/FormModal";
import type { ModalStateProps } from "#/hooks/useModalViewer";

export default function StaffCreateForm(props: ModalStateProps) {
  return (
    <FormModal
      state={props.state}
      title="Connecteur syslog CEF"
      subtitle={
        <span className="text-sm">
          Envoyer les journaux d'application au SIEM
        </span>
      }
      okText="Enregistrer"
      checkbox={false}
      className="grid grid-cols-2 gap-2"
    >
      <Form.Item label="Host" className="col-span-full">
        <Input placeholder="Nom d'hôte ou adresse IP" />
      </Form.Item>

      <Form.Item label="Port">
        <Input placeholder="port UDP" />
      </Form.Item>

      <Form.Item label="Intervalle d'envoi">
        <Input placeholder="0 = immédiat" />
      </Form.Item>
    </FormModal>
  );
}
