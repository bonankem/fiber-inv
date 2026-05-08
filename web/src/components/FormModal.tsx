import {
  Button,
  Checkbox,
  ConfigProvider,
  Form,
  Modal,
  type ThemeConfig,
} from "antd";
import type { ReactNode } from "react";
import type { ModalState } from "#/hooks/useModalViewer";

export type FormModalProps<T> = {
  state: ModalState;
  title: ReactNode;
  width?: number | string;
  subtitle?: ReactNode;
  children?: ReactNode;
  onSubmit?: (data: T) => void;
  className?: string;
};

const fz = 13;
const themeConfig: ThemeConfig = {
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
};

export default function FormModal<T>(props: FormModalProps<T>) {
  const { isOpen, close } = props.state;
  return (
    <Modal
      title={
        <header>
          <h2>{props.title}</h2>
          {props.subtitle && <p>{props.subtitle}</p>}
        </header>
      }
      width={props.width || 360}
      footer={null}
      mask={{ blur: true, closable: false }}
      open={isOpen}
      onCancel={close}
      className="text-sm pb-8!"
    >
      <ConfigProvider theme={themeConfig}>
        <Form
          size="small"
          layout="vertical"
          className="flex flex-col gap-4"
          onFinish={props.onSubmit}
        >
          <div className={props.className}>{props.children}</div>

          <Checkbox required>Je valide cette action</Checkbox>

          <div className="self-center w-full max-w-md grid grid-cols-2 gap-2">
            <Button onClick={close}>Annuler</Button>
            <Button type="primary" htmlType="submit">
              Envoyer
            </Button>
          </div>
        </Form>
      </ConfigProvider>
    </Modal>
  );
}
