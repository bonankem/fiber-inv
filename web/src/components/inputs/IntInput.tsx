import { InputNumber, type InputNumberProps, Space } from "antd";
import type { ReactNode } from "react";

type Props = InputNumberProps & {
  addonBefore?: ReactNode;
};

export default function IntInput(props: Props) {
  const { addonBefore, ...rest } = props;
  if (!rest.min) rest.min = 0;

  return (
    <Space.Compact className="w-full">
      {addonBefore && <Space.Addon>{addonBefore}</Space.Addon>}
      <InputNumber {...rest} />
    </Space.Compact>
  );
}
