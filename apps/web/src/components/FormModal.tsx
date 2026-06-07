import {
  Button,
  Checkbox,
  ConfigProvider,
  Divider,
  Form,
  type FormInstance,
  type FormProps,
  Modal,
  Spin,
  type ThemeConfig,
  theme,
} from "antd";
import { m } from "i18n/messages";
import type { ReactNode } from "react";
import type { ModalState } from "#/hooks/useModalViewer";
import { useUploader } from "#/hooks/useUploader";

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
  layout?: FormProps["layout"];
  initialValues?: Partial<T>;
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
  if (value && typeof value === "string") return value;
  return m.check_confirm();
}

export default function FormModal<T>(props: FormModalProps<T>) {
  const { isOpen, close } = props.state;
  const { token } = theme.useToken();
  const uploader = useUploader();

  const onClose = () => {
    uploader.cleanup();
    close();
  };

  return (
    <Modal
      title={
        <header>
          <h2>{props.title}</h2>
          {props.subtitle && (
            <p className="font-normal text-base text-yellow-600">
              {props.subtitle}
            </p>
          )}
          <Divider className="my-3!" />
        </header>
      }
      style={{ top: 20 }}
      width={props.width || 360}
      mask={{ blur: true, closable: props.maskCloseable ?? false }}
      open={isOpen}
      onCancel={onClose}
      className="text-sm pb-8!"
      footer={null}
      classNames={{ body: "overflow-x-hidden! *" }}
    >
      <Spin spinning={props.submitting || false}>
        <ConfigProvider theme={themeConfig}>
          <Form
            form={props.form}
            size="small"
            layout={props.layout ?? "vertical"}
            className="flex flex-col gap-4"
            onFinish={props.onSubmit}
            initialValues={props.initialValues}
          >
            <fieldset
              className={
                props.className || "flex flex-col gap-2 min-w-0 max-w-full"
              }
            >
              {props.children}
            </fieldset>

            {props.checkbox !== false && (
              <section>
                <Checkbox required>{checkboxText(props.checkbox)}</Checkbox>
              </section>
            )}

            <div
              className="self-center w-full max-w-md grid grid-cols-2 gap-2"
              style={{ backgroundColor: token.colorBgContainer }}
            >
              <Button onClick={close}>{m.back()}</Button>

              <Button
                type="primary"
                htmlType="submit"
                loading={props.submitting}
              >
                {m.send()}
              </Button>
            </div>
          </Form>
        </ConfigProvider>
      </Spin>
    </Modal>
  );
}
