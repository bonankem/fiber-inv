import { FileOutlined } from "@ant-design/icons";
import { Tag } from "antd";
import { useMemo } from "react";
import { uniqueBy } from "remeda";
import type { UploadT } from "schema/uploads";
import type { Maybe } from "schema/utils";
import type { WorkDocT } from "schema/work";
import { twJoin } from "tailwind-merge";
import FittedText from "./FittedText";

type Props = {
  files: Maybe<(UploadT | WorkDocT)[]>;
  className?: string;
};

export default function DownloadList(props: Props) {
  const uploads = useMemo(() => {
    if (!props.files?.length) return [];
    const list = props.files.map((f) => {
      return "upload" in f ? f.upload : f;
    });
    return uniqueBy(list, (up) => up.id);
  }, [props.files]);

  return (
    <ul
      className={twJoin("flex flex-col gap-2 overflow-hidden", props.className)}
    >
      {uploads.map((up) => (
        <li key={up.id} className="max-w-full">
          <a href="/" target="_blank" rel="noopener noreferrer">
            <Tag
              className={twJoin(
                "text-sm! w-fit! max-w-full! flex! flex-row bg-transparent!",
                "hover:border-yellow-400!",
                "dark:hover:text-yellow-400! dark:hover:border-yellow-400!",
              )}
              variant="outlined"
            >
              <div className="flex gap-2 overflow-hidden">
                <FileOutlined className="text-xs" />
                <FittedText text={up.name} longTail />
              </div>
            </Tag>
          </a>
        </li>
      ))}
    </ul>
  );
}
