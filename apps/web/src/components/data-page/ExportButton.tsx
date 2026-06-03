import { DownloadOutlined } from "@ant-design/icons";
import { Button } from "antd";

export default function ExportButton(props: { onClick?: () => void }) {
  return (
    <Button
      size="small"
      icon={<DownloadOutlined />}
      onClick={props.onClick}
      className="text-sm!"
    >
      Export
    </Button>
  );
}
