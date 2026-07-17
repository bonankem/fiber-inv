import { FileOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
import { useMemo } from "react";
import { uniqueBy } from "remeda";
import type { UploadT } from "schema/uploads";
import type { Maybe } from "schema/utils";
import type { WorkDocT } from "schema/work";
import { twJoin } from "tailwind-merge";
import { downloadUrl } from "#/api/helpers";
import FittedText from "./FittedText";

type Props = {
  files: Maybe<(UploadT | WorkDocT)[]>;
  className?: string;
};

function withUnit(n: number, unit: string) {
  const s = n < 10 ? Math.round(n * 10) / 10 : Math.round(n);
  return `${s}\u00a0${unit}`;
}

const K = 1024;
const M = 1024 * 1024;
function sizeText(size: number) {
  if (size < K) return withUnit(size, "bytes");
  if (size < M) return withUnit(size / K, "kB");
  return withUnit(size / M, "MB");
}

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
        <li key={up.id} className="max-w-full flex items-center">
          <Tooltip title={`${up.name} (${sizeText(up.size)})`} placement="left">
            <a
              href={downloadUrl(up)}
              target="_blank"
              rel="noopener noreferrer"
              className={twJoin(
                "w-fit max-w-full inline-flex px-3",
                "border border-blue-500! text-blue-500! rounded-xl",
                "dark:border-blue-400! dark:text-blue-400!",
                "hover:border-yellow-600! hover:text-yellow-600!",
                "dark:hover:border-yellow-500! dark:hover:text-yellow-500!",
                "transition-colors! duration-100!",
              )}
            >
              <FileOutlined className="text-xs mr-1" />
              <FittedText text={up.name} longTail />
            </a>
          </Tooltip>
        </li>
      ))}
    </ul>
  );
}
