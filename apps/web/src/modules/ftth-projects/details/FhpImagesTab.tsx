import { ExportOutlined } from "@ant-design/icons";
import { m } from "i18n/messages";
import { useMemo, useState } from "react";
import { groupBy, sortBy } from "remeda";
import { WorkDocType } from "schema/enums";
import { downloadUrl } from "#/api/helpers";
import type { FhpTabProps } from "./types";

const titles: Partial<Record<WorkDocType, string>> = {
  [WorkDocType.FHP_BOX]: m.boxes(),
  [WorkDocType.FHP_POLE]: m.poles(),
};

export default function FhpImagesTab(props: FhpTabProps) {
  const groups = useMemo(() => {
    const images = sortBy(
      props.images ?? [],
      [(i) => i.type, "asc"],
      [(i) => i.key, "asc"],
    );
    const groupedByType = Object.values(groupBy(images, (i) => i.type));
    const groups = groupedByType.map((g) => {
      const type = g[0].type;
      const name = titles[type] ?? type;
      const list = g.map((i) => ({ ...i, url: downloadUrl(i.upload) }));
      return { type, name, list };
    });
    return groups;
  }, [props.images]);

  type Index = [number, number];
  const [index, setIndex] = useState<Index>([0, 0]);
  const selected = groups[index[0]]?.list[index[1]];

  return (
    <div className="grid sm:grid-cols-2 h-[70dvh] overflow-hidden">
      <nav className="h-full overflow-y-auto gap-4 pr-4">
        {groups?.map((g, gi) => (
          <section key={g.type} className="mb-4">
            <h3 className="mb-2 font-medium">{g.name}</h3>
            <div className="grid grid-cols-4 gap-1 *:aspect-square!">
              {g.list.map((i, ii) => (
                <button
                  type="button"
                  key={i.id}
                  className="bg-gray-100 overflow-hidden relative"
                  onClick={() => setIndex([gi, ii])}
                >
                  <img
                    className="size-full object-cover"
                    alt={i.key}
                    src={i.url}
                  />
                  {gi === index[0] && ii === index[1] && (
                    <div className="absolute inset-0 bg-brand/50" />
                  )}
                </button>
              ))}
            </div>
          </section>
        ))}
      </nav>

      <div className="size-full flex flex-col">
        <header className="mb-2 flex flex-row gap-2 items-center">
          <div className="font-medium w-0 grow text-nowrap text-ellipsis">
            {selected?.key}
          </div>
          <a
            title="Open in new tab"
            href={selected?.url}
            target="_blank"
            rel="noopener"
          >
            Open in new tab <ExportOutlined className="text-[8m]!" />
          </a>
        </header>
        <div className="h-0 grow bg-gray-900 overflow-hidden">
          <img
            className="size-full rounded-md object-contain"
            src={selected?.url}
            alt={selected?.key}
          />
        </div>
      </div>
    </div>
  );
}
