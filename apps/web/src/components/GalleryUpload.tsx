import {
  CloseOutlined,
  EditOutlined,
  MinusCircleOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import type { UseQueryResult } from "@tanstack/react-query";
import {
  Button,
  type ButtonProps,
  Input,
  Spin,
  Tabs,
  Tooltip,
  Upload,
} from "antd";
import { m } from "i18n/messages";
import { ImageIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { countBy } from "remeda";
import type { WorkDocType } from "schema/enums";
import type { WorkDocT } from "schema/work";
import { twJoin } from "tailwind-merge";
import { downloadUrl } from "#/api/helpers";
import useOnceReady from "#/hooks/useOnceReady";
import { type Uploader, useUploader } from "#/hooks/useUploader";

export type GuItem<T> = {
  key: string;
  type: T;
  name?: string;
  newId?: string;
  old?: WorkDocT;
  removed?: boolean;
};

type Tab<T> = {
  type: T;
  name: string;
};

type Props<T> = {
  value: GuItem<T>[];
  onChange: (items: GuItem<T>[]) => void;
  initial: UseQueryResult<WorkDocT[]>;
  tabs: Tab<T>[];
  tab: T;
  onTab: (tab: T) => void;
};

export default function GalleryUpload<T extends WorkDocType>(props: Props<T>) {
  const { value, onChange, initial } = props;
  const up = useUploader();

  // set the old uploads as the initial value
  const old = useMemo(() => {
    return initial.data?.map((d) => ({
      key: d.id,
      old: d,
      type: d.type as T,
      name: d.key,
    }));
  }, [initial.data]);
  useOnceReady(old, onChange);

  const tabItems = useMemo(() => {
    return value.filter((i) => i.type === props.tab);
  }, [value, props.tab]);

  const add = (type: T, files: File[]) => {
    const newItems: GuItem<T>[] = files.map((file) => {
      const { id } = up.send(file, { type });
      return { key: id, newId: id, type };
    });
    onChange([...value, ...newItems]);
  };

  const modify = ({ key }: GuItem<T>, mod: Partial<GuItem<T>>) => {
    const newValue = value.map((older) => {
      if (older.key !== key) return older;
      const newer = { ...older, ...mod };
      if (newer.newId !== older.newId) {
        up.maybeCancel(older.newId);
      }
      return newer;
    });
    onChange(newValue);
  };

  const change = (item: GuItem<T>, file: File) => {
    const { id } = up.send(file, { type: props.tab });
    modify(item, { newId: id, removed: false });
  };

  const revert = (item: GuItem<T>) => {
    modify(item, { newId: undefined, removed: false });
  };

  const remove = (item: GuItem<T>) => {
    if (item.old) {
      modify(item, { newId: undefined, removed: true });
    } else {
      up.maybeCancel(item.newId);
      onChange(value.filter((i) => i.key !== item.key));
    }
  };

  const setName = (item: GuItem<T>, name: string) => {
    // cannot rename old items that were already submitted
    if (!item.old) modify(item, { name });
  };

  // count items under each tab, excluding removed items
  const counts = countBy(value, (i) => (i.removed ? "" : i.type));

  return (
    <Tabs
      type="card"
      size="small"
      activeKey={props.tab}
      onChange={(tab) => props.onTab(tab as T)}
      items={props.tabs.map(({ type, name }) => ({
        key: type,
        label: `${name} (${counts[type] || 0})`,
        children: (
          <div
            className={twJoin(
              "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
              "gap-2 *:h-36 sm:*:h-48 max-h-[60vh] overflow-y-auto",
            )}
          >
            {tabItems.map((item) => (
              <GuItemView
                key={item.key}
                up={up}
                item={item}
                onRevert={revert}
                onRemove={remove}
                onChange={change}
                onRename={setName}
              />
            ))}
            <GuAddButton type={type} onAdd={add} />
          </div>
        ),
      }))}
    />
  );
}

GalleryUpload.useState = <T,>(tabs: Tab<T>[]) => {
  const [tab, onTab] = useState(() => tabs[0].type);
  const [value, onChange] = useState<GuItem<T>[]>([]);
  return { value, onChange, tabs, tab, onTab };
};

function GuItemButton({
  title,
  danger,
  type = danger ? "primary" : "default",
  ...props
}: ButtonProps) {
  return (
    <Tooltip title={title} placement="top">
      <Button danger={danger} type={type} {...props} />
    </Tooltip>
  );
}

function GuRemovedOverlay() {
  return (
    <div className="bg-red-700/50 absolute inset-0 centered flex-col gap-2 text-white px-8">
      <MinusCircleOutlined className="text-3xl" />
      <p className="text-balance">{m.image_will_be_removed()}</p>
    </div>
  );
}

function GuImageTile({ url }: { url: string }) {
  return (
    <a href={url} target="_blank" rel="noopener" className="block min-h-0 grow">
      <Tooltip title="View Image" placement="top">
        <img className="size-full object-cover" alt="" src={url} />
      </Tooltip>
    </a>
  );
}

function guNameColor(item: GuItem<unknown>) {
  if (!item.old) return undefined;
  if (item.removed) return "text-red-600!";
  if (item.newId) return "text-green-600!";
  return "text-purple-600!";
}

function GuItemView<T>(props: {
  item: GuItem<T>;
  up: Uploader;
  onRevert: (i: GuItem<T>) => void;
  onRemove: (i: GuItem<T>) => void;
  onChange: (i: GuItem<T>, f: File) => void;
  onRename: (i: GuItem<T>, s: string) => void;
}) {
  const { item, up } = props;

  const oldUp = item.old?.upload;
  const newUp = item.newId ? up.find(item.newId) : null;
  const show = newUp?.done ? newUp : oldUp;
  const url = show && downloadUrl(show);

  const removed = item.removed;
  const swapped = !!(item.old && item.newId);

  return (
    <div className="gray-panel flex flex-col size-full overflow-hidden">
      <Spin
        spinning={newUp?.done === false}
        classNames={{ container: "h-full!" }}
        className="h-full!"
      >
        <div className="flex flex-col size-full relative">
          {url && <GuImageTile url={url} />}

          {removed && <GuRemovedOverlay />}

          <Input
            required
            readOnly={!!item.old}
            value={item.name}
            onChange={(e) => !item.old && props.onRename(item, e.target.value)}
            className={twJoin("w-full border-0! text-sm!", guNameColor(item))}
            placeholder={m.name()}
          />

          <div className="absolute top-1 right-1 flex gap-1 opacity-75 hover:opacity-100">
            <Upload
              accept="image/*"
              fileList={[]}
              beforeUpload={(file) => {
                props.onChange(item, file);
                return false;
              }}
            >
              <GuItemButton title={m.change_image()} icon={<EditOutlined />} />
            </Upload>

            {swapped || removed ? (
              <GuItemButton
                danger={!!item.newId}
                title={m.restore_old_image()}
                icon={<RollbackOutlined />}
                onClick={() => props.onRevert(item)}
              />
            ) : (
              <GuItemButton
                type="primary"
                danger
                title={m.remove()}
                icon={item.old ? <MinusCircleOutlined /> : <CloseOutlined />}
                onClick={() => props.onRemove(item)}
              />
            )}
          </div>
        </div>
      </Spin>
    </div>
  );
}

function GuAddButton<T>(props: {
  type: T;
  onAdd?: (type: T, files: File[]) => void;
}) {
  return (
    <Upload
      accept="image/*"
      multiple
      fileList={[]}
      classNames={{ trigger: "size-full" }}
      beforeUpload={(file, files) => {
        if (file !== files[0]) return false;
        props.onAdd?.(props.type, files);
        return false;
      }}
    >
      <button
        type="button"
        className="big-gray-button size-full centered flex-col gap-2 text-xs!"
      >
        <ImageIcon size={24} />
        <div>{m.upload_images()}</div>
      </button>
    </Upload>
  );
}
