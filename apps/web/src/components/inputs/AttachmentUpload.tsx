import {
  CloseOutlined,
  LoadingOutlined,
  PaperClipOutlined,
} from "@ant-design/icons";
import { Button, List, Progress, Upload } from "antd";
import type { UploadRecord } from "#/hooks/useUploader";
import { useUploader } from "#/hooks/useUploader";

type Props = {
  value?: string[];
  onChange?: (ids: string[]) => void;
};

export default function AttachmentUpload({ value = [], onChange }: Props) {
  const uploader = useUploader();

  const add = (file: File) => {
    const record = uploader.send(file);
    onChange?.([...value, record.id]);
    return false;
  };

  const remove = (id: string) => {
    uploader.maybeCancel(id);
    onChange?.(value.filter((item) => item !== id));
  };

  const records = value.map((id) => uploader.find(id) ?? fallbackRecord(id));

  return (
    <div className="flex flex-col gap-2">
      <Upload fileList={[]} beforeUpload={add} multiple>
        <Button icon={<PaperClipOutlined />}>Attach files</Button>
      </Upload>

      {!!records.length && (
        <List
          size="small"
          dataSource={records}
          renderItem={(record) => (
            <List.Item
              className="py-1!"
              actions={[
                <Button
                  key="remove"
                  danger
                  size="small"
                  icon={<CloseOutlined />}
                  onClick={() => remove(record.id)}
                />,
              ]}
            >
              <List.Item.Meta
                avatar={
                  record.done ? <PaperClipOutlined /> : <LoadingOutlined spin />
                }
                title={<span className="text-sm">{record.name}</span>}
                description={
                  record.done ? null : (
                    <Progress percent={record.percent} size="small" />
                  )
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );
}

function fallbackRecord(id: string): UploadRecord {
  return {
    id,
    name: id,
    size: 0,
    done: true,
    percent: 100,
  };
}
