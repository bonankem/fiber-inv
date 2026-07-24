import dayjs from "dayjs";
import { m } from "i18n/messages";
import { useMemo } from "react";
import { sortBy } from "remeda";
import { zArray } from "schema/utils";
import { type WorkLogT, workLogZ } from "schema/work";
import { useApiGet } from "#/api/helpers";
import WithCaption from "#/components/WithCaption";
import { shortName } from "#/utils/names";
import DataTable from "./data-page/DataTable";

function LogCaption(props: { log: WorkLogT }) {
  const from = props.log.fromUser || { name: "Leo Aso" };
  const to = props.log.toNames?.[0];
  if (!from && !to) return null;

  return (
    <p>
      {from && <span className="text-gray-400">par </span>}
      {from && <span>{shortName(from.name, 15)} </span>}
      {to && <span className="text-gray-400">à </span>}
      {to && <span>{shortName(to, 15)}</span>}
    </p>
  );
}

function DateTimeView(props: { value: dayjs.ConfigType }) {
  const day = dayjs(props.value);
  const date = day.format("DD MMM YYYY");
  const time = day.format("hh:mm");

  return <WithCaption title={date} caption={time} />;
}

export default function WorkLogsTab({ id }: { id: string }) {
  const query = useApiGet(["work", id, "logs"], zArray(workLogZ));
  const sorted = useMemo(
    () => sortBy(query.data ?? [], [(l) => l.createdAt, "desc"]),
    [query.data],
  );

  return (
    <DataTable
      bordered
      data={sorted}
      loading={query.isLoading}
      columns={[
        {
          key: "time",
          title: m.date_time(),
          width: 120,
          render: (l) => <DateTimeView value={l.createdAt} />,
        },
        {
          key: "action",
          title: "Action",
          width: 240,
          render: (l) => (
            <WithCaption title={l.action} caption={<LogCaption log={l} />} />
          ),
        },
        {
          key: "comment",
          title: m.comments_attachments(),
          width: 320,
          render: (l) => l.comment,
        },
      ]}
    />
  );
}
