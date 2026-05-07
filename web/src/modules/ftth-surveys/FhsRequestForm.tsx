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
  return <h2 className="mb-4">{props.children}</h2>;
}

export default function FhsRequestForm(props: ModalStateProps) {
  const fz = 13;
  return (
    <Modal
      title={<Title>Demande d'etude FTTH</Title>}
      width={320}
      footer={null}
      mask={{ blur: true, closable: false }}
      open={props.state.isOpen}
      onCancel={props.state.close}
      className="text-sm pb-8!"
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

            <Form.Item label="Ville">
              <TownSelect />
            </Form.Item>

            <Form.Item label="Nom de la plaque">
              <Input required />
            </Form.Item>

            <Form.Item label="Contact local">
              <Input required placeholder="Nom et téléphone" />
            </Form.Item>

            <Form.Item label="Envoyer à Responsable">
              <Select />
            </Form.Item>

            <Form.Item label="Commentaire">
              <Input.TextArea rows={3} className="resize-none!" />
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
