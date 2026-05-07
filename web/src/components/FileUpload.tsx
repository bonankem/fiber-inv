import { PaperClipOutlined } from "@ant-design/icons";
import { Button, Input, Upload } from "antd";

type Props = {
  value?: string;
  onChange?: (id: string) => void;
  placeholder?: string;
};

export default function FileUpload(props: Props) {
  const onUpload = (file: File) => {
    return false;
  };
  return (
    <Upload fileList={[]} classNames={{ root: "block", trigger: "w-full" }}>
      <div className="flex gap-1">
        <Input
          size="small"
          readOnly
          className="cursor-pointer grow"
          placeholder={props.placeholder}
        />
        <Button size="small" className="w-10!" icon={<PaperClipOutlined />} />
      </div>
    </Upload>
  );
}
