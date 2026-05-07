import {
  Button,
  Checkbox,
  ConfigProvider,
  Form,
  Input,
  Modal,
  Select,
} from "antd";
import type { PropsWithChildren } from "react";
import FileUpload from "#/components/FileUpload";
import TownSelect from "#/components/TownSelect";
import type { ModalStateProps } from "#/hooks/useModalViewer";

function Title(props: PropsWithChildren) {
  return <h2 className="text-center mb-4">{props.children}</h2>;
}

export default function FhsRequestForm(props: ModalStateProps) {
  const fz = 13;
  return (
    <Modal
      title={<Title>Nouvelle demande d'etude</Title>}
      width={320}
      footer={null}
      closable={false}
      mask={{ blur: true, closable: false }}
      open={props.state.isOpen}
      onCancel={props.state.close}
      className="text-sm"
    >
      <ConfigProvider
        theme={{
          token: {
            controlHeightSM: 28,
            fontSizeSM: fz,
          },
          components: {
            Input: { inputFontSizeSM: fz },
            Select: { fontSizeSM: fz, fontSize: fz, optionFontSize: fz },
            Cascader: { fontSizeSM: fz },
            Form: { labelFontSize: fz, itemMarginBottom: 0 },
            Button: { fontSize: fz },
            Checkbox: { fontSize: fz },
          },
        }}
      >
        <Form size="small" layout="vertical">
          <div className="grid grid-cols-1 gap-2">
            <Form.Item label="Fichier KMZ de la plaque">
              <FileUpload placeholder="Choisir un fichier KMZ ou KML" />
            </Form.Item>

            <Form.Item label="Nom de la plaque">
              <Input required />
            </Form.Item>

            <Form.Item label="Ville">
              <TownSelect />
            </Form.Item>

            <Form.Item label="Nom du contact">
              <Input required />
            </Form.Item>

            <Form.Item label="Téléphone du contact">
              <Input />
            </Form.Item>

            <Form.Item label="Envoyer à">
              <Select size="small" placeholder="Responsable planning" />
            </Form.Item>

            <Form.Item label="Commentaire">
              <Input.TextArea rows={4} className="resize-none!" />
            </Form.Item>
          </div>

          <Checkbox required className="mt-4!">
            Je valide cette action
          </Checkbox>

          <div className="grid grid-cols-2 gap-2 mt-4 mb-2">
            <Button onClick={props.state.close}>Annuler</Button>
            <Button type="primary" htmlType="submit">
              Envoyer
            </Button>
          </div>
        </Form>
      </ConfigProvider>
    </Modal>
  );
}
