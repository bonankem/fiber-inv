import { CloseOutlined } from "@ant-design/icons";
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
import { useEffect, useMemo, useState } from "react";
import { countBy } from "remeda";
import type { WorkDocType } from "schema/enums";
import type { WorkDocT } from "schema/work";
import { twJoin } from "tailwind-merge";
import { downloadUrl } from "#/api/helpers";
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

  const [ready, setReady] = useState(false);
  useEffect(() => {
    const data = initial.data;
    if (ready || !data) return;
    setReady(true);
    onChange(
      data.map((d) => ({
        key: d.id,
        old: d,
        type: d.type as T,
        name: d.key,
      })),
    );
  }, [initial.data, ready, onChange]);

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

  const modify = (key: string, item: () => GuItem<T>) => {
    onChange(value.map((i) => (i.key === key ? item() : i)));
  };

  const change = (item: GuItem<T>, file: File) => {
    const { id } = up.send(file, { type: props.tab });
    modify(item.key, () => ({
      ...item,
      key: item.old?.id || id,
      newId: id,
      removed: false,
    }));
  };

  const revert = (item: GuItem<T>) => {
    if (!item.old) return;
    modify(item.key, () => ({
      ...item,
      newId: undefined,
      removed: false,
    }));
  };

  const remove = (item: GuItem<T>) => {
    if (item.newId) {
      up.cancel([item.newId]);
    }
    if (item.old) {
      modify(item.key, () => ({ ...item, newId: undefined, removed: true }));
    } else {
      onChange(value.filter((i) => i.key !== item.key));
    }
  };

  const setname = (item: GuItem<T>, name: string) => {
    // can only rename items that were not already submitted
    if (!item.old) modify(item.key, () => ({ ...item, name }));
  };

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
              "grid sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
              "gap-2 *:h-48 max-h-[60vh] overflow-y-auto",
            )}
          >
            {tabItems.map((item) => (
              <ItemView
                up={up}
                item={item}
                key={item.key}
                onRevert={revert}
                onRemove={remove}
                onChange={change}
                onSetname={setname}
              />
            ))}
            <AddButton type={type} onAdd={add} />
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

function ItemButton({ title, ...props }: ButtonProps) {
  return (
    <Tooltip title={title} placement="top">
      <Button {...props} />
    </Tooltip>
  );
}

function ItemView<T>(props: {
  item: GuItem<T>;
  up: Uploader;
  onRevert: (i: GuItem<T>) => void;
  onRemove: (i: GuItem<T>) => void;
  onChange: (i: GuItem<T>, f: File) => void;
  onSetname: (i: GuItem<T>, s: string) => void;
}) {
  const { item, up } = props;

  const oldUp = item.old?.upload;
  const newUp = item.newId ? up.find(item.newId) : null;
  const show = newUp?.done ? newUp : oldUp;
  const url = show && downloadUrl(show);

  return (
    <div
      className={twJoin("gray-panel flex flex-col size-full overflow-hidden")}
    >
      <Spin
        spinning={newUp?.done === false}
        className="h-full!"
        classNames={{ container: "h-full!" }}
      >
        <div className="flex flex-col size-full relative">
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener"
              className="block min-h-0 grow"
            >
              <Tooltip title="View Image" placement="top">
                <img className="size-full object-cover" alt="" src={url} />
              </Tooltip>
            </a>
          )}
          <Input
            required
            readOnly={!!item.old}
            value={item.name}
            onChange={(e) => !item.old && props.onSetname(item, e.target.value)}
            className={twJoin(
              "w-full border-0! text-sm!",
              item.old && "text-purple-600!",
            )}
            placeholder={m.name()}
          />
          <div className="absolute top-1 right-1 flex gap-1 opacity-75 hover:opacity-100">
            {item.newId && !item.old && (
              <ItemButton
                type="primary"
                danger
                title="Remove"
                icon={<CloseOutlined />}
                onClick={() => props.onRemove(item)}
              />
            )}
          </div>
        </div>
      </Spin>
    </div>
  );
}

function AddButton<T>(props: {
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
        <div>Upload Image</div>
      </button>
    </Upload>
  );
}
