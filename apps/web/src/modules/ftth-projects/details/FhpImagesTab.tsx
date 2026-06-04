import { Spin, Tabs, Tooltip } from "antd";
import { useMemo } from "react";
import { groupBy } from "remeda";
import { fhpImageZ } from "schema/fhp";
import { zArray } from "schema/utils";
import { downloadUrl, useApiGet } from "#/api/helpers";
import type { FhpTabProps } from "./types";

export default function FhpImagesTab(props: FhpTabProps) {
  const query = useApiGet(["fhp", props.item.id, "images"], zArray(fhpImageZ));
  const groups = useMemo(() => {
    if (!query.data) return [];
    const grouped = Object.values(groupBy(query.data, (i) => i.type));
    return grouped.map((images) => ({
      type: images[0].type,
      count: images.length,
      images: images.map((i) => ({ ...i, url: downloadUrl(i.doc.upload) })),
    }));
  }, [query.data]);

  return (
    <Spin spinning={query.isLoading}>
      <Tabs
        tabPlacement="start"
        items={groups.map((g) => ({
          key: g.type,
          label: g.type,
          children: (
            <section className="grid md:grid-cols-3 gap-2">
              {g.images.map((i) => (
                <Tooltip
                  key={i.id}
                  title={i.name || i.doc.upload.name}
                  placement="top"
                >
                  <a href={i.url} target="_blank" rel="noopener noreferrer">
                    <img
                      src={i.url}
                      alt={i.name || i.doc.upload.name}
                      className="w-full h-40 object-cover rounded-md"
                    />
                  </a>
                </Tooltip>
              ))}
            </section>
          ),
        }))}
      />
    </Spin>
  );
}
