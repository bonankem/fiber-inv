import {
  Button,
  Checkbox,
  ConfigProvider,
  Drawer,
  Form,
  type FormInstance,
  Modal,
  type ThemeConfig,
  theme,
} from "antd";
import { type ReactNode, useState } from "react";
import type { ModalState } from "#/hooks/useModalViewer";

export type FormModalProps<T> = {
  form?: FormInstance<T>;
  state: ModalState;
  title: ReactNode;
  width?: number | string;
  subtitle?: ReactNode;
  children?: ReactNode;
  onSubmit?: (data: T) => void;
  submitting?: boolean;
  className?: string;
  checkbox?: boolean | string;
  maskCloseable?: boolean;
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

function checkboxText(value: boolean | string | undefined) {
  if (typeof value === "string" && value) return value;
  return "Je valide cette action";
}

export default function FormModal<T>(props: FormModalProps<T>) {
  const [empty, setEmpty] = useState(true);
  const { isOpen, close } = props.state;
  const { token } = theme.useToken();

  const useModal = true;
  const Root = useModal ? Modal : Drawer;

  return (
    <Root
      title={
        <header>
          <h2>{props.title}</h2>
          {props.subtitle && <p>{props.subtitle}</p>}
        </header>
      }
      style={{ top: 20 }}
      width={props.width || 320}
      mask={{ blur: true, closable: props.maskCloseable ?? empty }}
      open={isOpen}
      onClose={close}
      onCancel={close}
      closable={false}
      className="text-sm pb-8!"
      footer={null}
    >
      <ConfigProvider theme={themeConfig}>
        <Form
          form={props.form}
          size="small"
          layout="vertical"
          className="flex flex-col gap-4"
          onFinish={props.onSubmit}
          onFieldsChange={() => setEmpty(false)}
        >
          <fieldset className={props.className || "flex flex-col gap-2"}>
            {props.children}
          </fieldset>

          {props.checkbox !== false && (
            <Checkbox required>{checkboxText(props.checkbox)}</Checkbox>
          )}

          <div
            className="self-center w-full max-w-md grid grid-cols-2 gap-2"
            style={{ backgroundColor: token.colorBgContainer }}
          >
            <Button onClick={close}>Annuler</Button>

            <Button type="primary" htmlType="submit" loading={props.submitting}>
              Envoyer
            </Button>
          </div>
        </Form>
      </ConfigProvider>
    </Root>
  );
}
