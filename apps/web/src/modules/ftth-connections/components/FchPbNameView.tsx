import { Tooltip } from "antd";
import { getLocale } from "i18n/runtime";

const fr = getLocale() === "fr";

export default function FhcPbNameView(props: {
  item: { nameEn: string; nameFr: string };
}) {
  const name = fr ? props.item.nameFr : props.item.nameEn;

  return (
    <Tooltip
      title={name}
      placement="bottomLeft"
      className="w-fit"
      classNames={{ container: "whitespace-pre-line" }}
    >
      <span className="overflow-x-hidden max-w-full text-ellipsis">{name}</span>
    </Tooltip>
  );
}
