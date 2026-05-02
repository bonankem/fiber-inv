import { DownloadOutlined, EllipsisOutlined } from "@ant-design/icons";
import {
  Button,
  ConfigProvider,
  DatePicker,
  Input,
  Pagination,
  Select,
  Table,
  type TableColumnsType,
  type ThemeConfig,
  theme,
} from "antd";
import { Filter } from "lucide-react";
import { type ReactNode, useState } from "react";
import { sumBy } from "remeda";
import { twJoin } from "tailwind-merge";
import { fakeSurveys } from "#/data/fake";
import TownSelect from "./TownSelect";
import WithCaption from "./WithCaption";

const statTheme: ThemeConfig = {
  components: {
    Statistic: {
      contentFontSize: 20,
      titleFontSize: 12,
    },
  },
  token: {
    lineHeight: 1.1,
  },
};

function SubsetCard(props: {
  label: string;
  count?: number | null;
  active?: boolean;
  onClick?: () => void;
}) {
  const { token } = theme.useToken();
  return (
    <button
      type="button"
      className={twJoin(
        "h-15 rounded-md cursor-pointer overflow-hidden",
        "flex justify-between items-center text-start",
        props.active && "bg-[#ffcb05]! text-black!",
      )}
      style={{
        backgroundColor: props.active ? "#ffcb05" : token.colorBgContainer,
      }}
      onClick={props.onClick}
    >
      <div className="w-full flex flex-col leading-0 text-center md:text-start mx-3 md:mx-4 overflow-hidden">
        <div className="text-xs md:text-base font-bold">
          {props.count ?? "-"}
        </div>
        <div className="text-xs md:text-sm font-medium whitespace-nowrap text-ellipsis">
          {props.label}
        </div>
      </div>
    </button>
  );
}

const fText = (name: string) => () => (
  <Input
    allowClear
    size="small"
    placeholder={`Filter ${name}`}
    className="font-normal w-full text-sm!"
  />
);

const fCity = () => (
  <TownSelect
    size="small"
    className="w-full! font-normal text-sm!"
    placeholder="Filter City"
    changeOnSelect
  />
);

const fDate = (name: string) => () => (
  <DatePicker
    allowClear
    size="small"
    placeholder={`Filter ${name}`}
    className="font-normal w-full text-sm!"
  />
);

const fDrop = (name: string) => () => (
  <Select
    allowClear
    size="small"
    placeholder={`Filter ${name}`}
    className="font-normal w-full text-sm!"
  />
);

const fNone = () => <Input size="small" disabled className="invisible" />;

type FilterNode = () => ReactNode;

export default function FakePage() {
  const [filtering, setFiltering] = useState(false);
  const [card, setCard] = useState("Total");

  const cards = [
    { label: "Total", count: 123 },
    { label: "My Pending", count: 8 },
    { label: "Open", count: 90 },
    { label: "Stopped", count: 5 },
    { label: "Closed", count: 28 },
  ];

  const titled = (
    name: ReactNode,
    f1: FilterNode = fNone,
    f2: FilterNode = fNone,
    control: boolean = false,
  ) => {
    const header = control ? (
      <div className="flex items-center justify-between">
        {name}

        <Button
          className={twJoin(
            "text-yellow-600 hover:text-yellow-500",
            "h-5! text-base! p-2! gap-2!",
          )}
          onClick={() => setFiltering((f) => !f)}
        >
          {filtering ? (
            "Clear"
          ) : (
            <span className="flex flex-row items-center gap-1">
              <Filter size={10} /> Filter
            </span>
          )}
        </Button>
      </div>
    ) : (
      name
    );

    if (!filtering) return header;
    return (
      <div className="flex flex-col gap-1 items-stretch w-full">
        {header}
        {f1()}
        {f2()}
      </div>
    );
  };

  const columns = [
    {
      title: titled("ID", fText("ID"), fDate("Date")),
      responsive: ["sm"],
      dataIndex: "sid",
      width: 120,
    },
    {
      title: titled("Name", fText("Name"), fCity, true),
      dataIndex: "name",
      width: 200,
      render: (_, t) => <WithCaption title={t.name} caption={t.city} />,
    },
    {
      title: titled("Assigned", fDrop("Engineer"), fDrop("Vendor")),
      key: "assigned",
      width: 150,
      render: (_, t) => <WithCaption title={t.engineer} caption={t.vendor} />,
    },
    {
      title: titled("Status", fDrop("Status"), fDrop("Pending On")),
      dataIndex: "status",
      width: 150,
      render: (_, t) => <WithCaption title={t.status} caption={t.vendor} />,
    },
    {
      title: "Action",
      dataIndex: "action",
      width: 50,
      fixed: "right",
      align: "center",
      render: () => (
        <Button size="small" type="text">
          <EllipsisOutlined className="text-2xl" />
        </Button>
      ),
    },
  ] satisfies TableColumnsType;

  const width = sumBy(columns, (c) => c.width + 40);

  return (
    <div className="py-4 px-4 md:px-8 flex flex-col items-stretch gap-3">
      <ConfigProvider theme={statTheme}>
        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {cards.map((c) => (
            <SubsetCard
              {...c}
              key={c.label}
              active={c.label === card}
              onClick={() => setCard(c.label)}
            />
          ))}
        </div>
      </ConfigProvider>

      <Table
        dataSource={fakeSurveys.slice(
          0,
          cards.find((c) => c.label === card)?.count || 100,
        )}
        size="small"
        bordered
        rowKey={(r) => r.sid}
        scroll={{ x: width }}
        pagination={false}
        classNames={{
          header: { cell: "text-sm", wrapper: "sticky top-0 z-100" },
          body: {
            cell: "text-sm one-line",
          },
          content: "max-h-[calc(100dvh-240px)]! overflow-y-scroll!",
        }}
        columns={columns}
        footer={() => (
          <footer className="flex items-center justify-between">
            <div>
              <Button
                size="small"
                className="text-sm!"
                icon={<DownloadOutlined />}
              >
                Export
              </Button>
            </div>

            <Pagination size="small" />
          </footer>
        )}
      />
    </div>
  );
}
