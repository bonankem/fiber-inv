import { CloseOutlined } from "@ant-design/icons";
import { Button, Card, Input, Select, Spin, Tooltip } from "antd";
import { downloadUrl } from "#/api/helpers";
import type { Uploader } from "#/hooks/useUploader";
import { selectProps } from "#/utils/select";
import type { FhsImageNames } from "./hooks";
import type { Entry } from "./types";

export default function FhsImageCard(props: {
  uploader: Uploader;
  entry: Entry;
  names: FhsImageNames;
  onRemove: (e: Entry) => void;
  onSetName: (e: Entry, name: string) => void;
}) {
  const { entry, names: plan, uploader } = props;
  const up = uploader.find(entry.uploadId);
  const url = up?.done ? downloadUrl(up) : undefined;
  const names = plan.data?.[entry.type];
  return (
    <Card
      key={entry.uploadId}
      className="overflow-hidden!"
      classNames={{
        root: "relative",
        body: "p-0! text-xs!",
        cover: "h-30! overflow-hidden!",
      }}
      cover={
        url ? (
          <Tooltip title={up?.name} placement="top">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-full"
            >
              <img
                src={url}
                alt={up?.name}
                className="w-full h-full object-cover"
              />
            </a>
          </Tooltip>
        ) : (
          <Spin className="w-full h-full" classNames={{ container: "h-full" }}>
            <div className="bg-gray-400/50 h-full w-full" />
          </Spin>
        )
      }
    >
      <Button
        icon={<CloseOutlined />}
        className="absolute! top-1 right-1 bg-red-600/40! hover:bg-red-600/80! text-white!"
        onClick={() => props.onRemove(entry)}
      />
      {names?.length === 0 ? (
        <Input
          required
          placeholder="Item Label"
          variant="borderless"
          className="h-8! text-xs! font-medium"
          value={entry.name}
          onChange={(e) => props.onSetName(entry, e.target.value)}
        />
      ) : (
        <Select
          placeholder="Item Label"
          variant="borderless"
          className="h-8! text-xs! font-medium w-full"
          classNames={{ popup: { listItem: "text-xs!" } }}
          loading={plan.isLoading}
          {...selectProps(names)}
          value={entry.name}
          onChange={(name) => props.onSetName(entry, name)}
        />
      )}
    </Card>
  );
}
