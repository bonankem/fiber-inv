import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { zArray } from "schema/utils";
import { type WorkLogT, workLogZ } from "schema/work";
import { getJson } from "#/api/helpers";
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
  const query = useQuery({
    queryFn: () => getJson(`work/${id}/logs`, zArray(workLogZ)),
    queryKey: ["work", id, "logs"],
  });

  return (
    <DataTable
      bordered
      data={query.data}
      loading={query.isLoading}
      columns={[
        {
          key: "action",
          title: "Action",
          width: 240,
          render: (l) => (
            <WithCaption title={l.action} caption={<LogCaption log={l} />} />
          ),
        },
        {
          key: "time",
          title: "Date/heure",
          width: 120,
          render: (l) => <DateTimeView value={l.createdAt} />,
        },
        {
          key: "comment",
          title: "Commentaires/fichiers joints",
          width: 320,
          render: (l) => l.comment,
        },
      ]}
    />
  );
}
