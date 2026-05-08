import {
  Button,
  Checkbox,
  ConfigProvider,
  Drawer,
  Form,
  type ThemeConfig,
  theme,
} from "antd";
import { type ReactNode, useState } from "react";
import type { ModalState } from "#/hooks/useModalViewer";

export type FormModalProps<T> = {
  state: ModalState;
  title: ReactNode;
  width?: number | string;
  subtitle?: ReactNode;
  children?: ReactNode;
  onSubmit?: (data: T) => void;
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

  return (
    <Drawer
      title={
        <header>
          <h2>{props.title}</h2>
          {props.subtitle && <p>{props.subtitle}</p>}
        </header>
      }
      width={props.width || 320}
      mask={{ blur: true, closable: props.maskCloseable ?? empty }}
      open={isOpen}
      onClose={close}
      closable={false}
      className="text-sm pb-8!"
      footer={null}
    >
      <ConfigProvider theme={themeConfig}>
        <Form
          size="small"
          layout="vertical"
          className="flex flex-col gap-4"
          onFinish={props.onSubmit}
          onFieldsChange={() => {
            console.log("Changed");
            setEmpty(false);
          }}
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
            <Button type="primary" htmlType="submit">
              Envoyer
            </Button>
            <Button onClick={close}>Annuler</Button>
          </div>
        </Form>
      </ConfigProvider>
    </Drawer>
  );
}
