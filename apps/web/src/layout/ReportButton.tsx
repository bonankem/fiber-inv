import { FileExcelOutlined } from "@ant-design/icons";
import { Button } from "antd";
import dayjs from "dayjs";
import { m } from "i18n/messages";
import { useApiReport } from "#/api/helpers";

type Props = {
  path: string;
  name?: string;
  action?: () => void;
};

export default function ReportButton(props: Props) {
  const query = useApiReport(props.path);
  const onReport = async () => {
    if (props.action) return props.action();

    const date = dayjs().format("YYYYMMDD-HHmm");
    const name = `${props.name ?? "report"}-${date}.csv`;
    try {
      const csv = await query.mutateAsync();
      const blob = new Blob([`\ufeff${csv}`], {
        type: "text/csv;charset=utf-8;",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = name;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (e) {
      console.error(e);
    }
  };
  return (
    <Button
      size="small"
      icon={<FileExcelOutlined className="text-[0.8em]" />}
      onClick={onReport}
      loading={query.isPending}
    >
      {m.report()}
    </Button>
  );
}
