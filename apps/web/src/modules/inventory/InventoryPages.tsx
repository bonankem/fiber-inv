import * as XLSX from "@e965/xlsx";
import {
  App,
  Button,
  Dropdown,
  Input,
  Table,
  type TableColumnsType,
} from "antd";
import { unzipSync } from "fflate";
import { m } from "i18n/messages";
import { Filter, RotateCw, Upload } from "lucide-react";
import { type MouseEvent, useEffect, useMemo, useState } from "react";
import { EmrfStatus } from "schema/enums";
import ActionsButton from "#/components/actions/ActionsButton";
import SubsetCards from "#/components/data-page/SubsetCards";
import { ImportModal } from "#/components/ImportModal";
import { NewEmrfModal } from "#/components/NewEmrfModal";
import StatusBadge, { statusName } from "#/components/StatusBadge";
import { useModalViewer } from "#/hooks/useModalViewer";
import { usePageHeaderActions } from "#/layout/PageHeaderActions";
import {
  type EquipmentRecord,
  useCreateEquipment,
  useEmrfCounts,
  useEmrfList,
  useEquipmentList,
} from "#/modules/hooks/inventory";
import { EmrfDetailsDrawer, emrfActions } from "./emrf-actions";
import {
  type EmrfRow,
  emrfJobName,
  emrfSegments,
  emrfTotal,
  emrfVendor,
} from "./emrf-utils";

/* -------------------------------------------------------------------------- */
/*                                  Warehouse                                 */
/* -------------------------------------------------------------------------- */

type StockRow = Pick<
  EquipmentRecord,
  | "id"
  | "name"
  | "description"
  | "mtnCode"
  | "ifsCode"
  | "partNumber"
  | "available"
  | "dateSynced"
>;

const stockColumns: TableColumnsType<StockRow> = [
  { title: "MTN Code", dataIndex: "mtnCode", width: 130, fixed: "left" },
  { title: "Name", dataIndex: "name", width: 280, ellipsis: true },
  {
    title: "Description",
    dataIndex: "description",
    width: 340,
    ellipsis: true,
  },
  { title: "IFS Code", dataIndex: "ifsCode", width: 130 },
  { title: "Part Number", dataIndex: "partNumber", width: 160 },
  { title: "Available", dataIndex: "available", width: 100, align: "right" },
  {
    title: "Date Synced",
    dataIndex: "dateSynced",
    width: 140,
    render: (val: string | undefined) => val || "—",
  },
];

const stockPreviewColumns = [
  { title: "MTN Code", dataIndex: "mtnCode", width: 110 },
  { title: "Name", dataIndex: "name", width: 240, ellipsis: true },
  {
    title: "Description",
    dataIndex: "description",
    width: 200,
    ellipsis: true,
  },
  { title: "IFS Code", dataIndex: "ifsCode", width: 100 },
  { title: "Part No", dataIndex: "partNumber", width: 120 },
  {
    title: "Available",
    dataIndex: "available",
    width: 90,
    align: "right" as const,
  },
  {
    title: "Date Synced",
    dataIndex: "dateSynced",
    width: 110,
    render: (val: string | undefined) => val || "—",
  },
];

const emptyFilters = {
  itemCode: "",
  search: "",
};

export function InventoryStockPage() {
  const { message } = App.useApp();
  const { setActions: setHeaderActions } = usePageHeaderActions();
  const [filters, setFilters] = useState(emptyFilters);
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [importOpen, setImportOpen] = useState(false);

  const query = useEquipmentList({
    search: filters.search || undefined,
    page: 1,
    pageSize: 200,
  });
  const createEquipment = useCreateEquipment();

  const rows = query.data?.items ?? [];

  // Client-side refinement on top of server search.
  const filtered = useMemo(
    () =>
      rows.filter(
        (row) =>
          row.mtnCode.toLowerCase().includes(filters.itemCode.toLowerCase()) &&
          `${row.name} ${row.description} ${row.ifsCode} ${row.partNumber}`
            .toLowerCase()
            .includes(filters.search.toLowerCase()),
      ),
    [rows, filters],
  );

  usePageActions({
    setHeaderActions,
    filtersVisible,
    setFiltersVisible,
    setImportOpen,
    query,
    message,
  });

  return (
    <main className="flex h-full min-h-0 flex-col gap-3 px-4 py-4 md:px-6">
      {filtersVisible && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-6">
          <Input
            allowClear
            placeholder="Item Code"
            value={filters.itemCode}
            onChange={(e) =>
              setFilters({ ...filters, itemCode: e.target.value })
            }
          />
          <Input
            allowClear
            placeholder="Search"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
      )}

      <Table<StockRow>
        columns={stockColumns}
        dataSource={filtered}
        footer={() => `${filtered.length} lines`}
        loading={query.isLoading}
        pagination={{ pageSize: 10, showSizeChanger: false }}
        rowKey="id"
        scroll={{ x: 1280, y: Math.max(300, window.innerHeight - 320) }}
        size="small"
      />

      <ImportModal<StockRow>
        accept=".csv,.tsv,.xlsx,.xls,.json,.kml,.kmz"
        columns={stockPreviewColumns}
        hint="Choose a CSV, TSV, Excel, JSON, KML, or KMZ stock file. Rows will replace the current stock list."
        importLabel="Import stock"
        onClose={() => setImportOpen(false)}
        onImport={async (parsed) => {
          let saved = 0;
          try {
            for (const row of parsed) {
              await createEquipment.mutateAsync({
                name: row.name,
                description: row.description || null,
                mtnCode: row.mtnCode,
                ifsCode: row.ifsCode || null,
                partNumber: row.partNumber || null,
                available: row.available,
                dateSynced: row.dateSynced,
              });
              saved++;
            }
          } catch (error) {
            await query.refetch();
            if (saved > 0) {
              message.warning(
                `${saved} of ${parsed.length} rows were saved before the import stopped.`,
              );
            }
            throw error;
          }
          await query.refetch();
          message.success(`${saved} stock rows imported`);
          setImportOpen(false);
          setFilters(emptyFilters);
        }}
        open={importOpen}
        parse={readStockFile}
        rowKey={(row) => row.id}
        title="Import stock on hand"
      />
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/*                               File Parsing                                 */
/* -------------------------------------------------------------------------- */

const fieldAliases: Record<keyof Omit<StockRow, "id">, string[]> = {
  mtnCode: [
    "mtncode",
    "itemcode",
    "materialcode",
    "productcode",
    "sku",
    "code",
    "itemno",
    "itemnumber",
    "materialnumber",
    "material",
    "itemid",
  ],
  ifsCode: ["ifscode", "ifsitemcode", "ifsnumber"],
  partNumber: ["partnumber", "partno", "mpn", "model", "itempartnumber"],
  name: [
    "name",
    "description",
    "material",
    "item",
    "itemdescription",
    "materialdescription",
    "partdescription",
    "productname",
    "equipmentname",
  ],
  description: [
    "description",
    "details",
    "longdescription",
    "itemdescription",
    "materialdescription",
  ],
  available: [
    "available",
    "quantity",
    "qty",
    "onhand",
    "stockonhand",
    "stockqty",
    "stockquantity",
    "closingqty",
    "closingstock",
    "balance",
    "quantityavailable",
  ],
  dateSynced: ["datesynced", "date", "syncdate"],
};

function normalizeHeader(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function readField(record: Record<string, unknown>, aliases: string[]) {
  const accepted = new Set(aliases);
  return Object.entries(record).find(([key]) =>
    accepted.has(normalizeHeader(key)),
  )?.[1];
}

function recordsFromSheet(sheet: XLSX.WorkSheet): Record<string, unknown>[] {
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: "",
    raw: false,
    blankrows: false,
  });
  let headerIndex = -1;
  let highestScore = 0;

  for (let index = 0; index < Math.min(matrix.length, 25); index++) {
    const normalized = new Set(
      matrix[index].map((cell) => normalizeHeader(String(cell ?? ""))),
    );
    const score = Object.values(fieldAliases).filter((aliases) =>
      aliases.some((alias) => normalized.has(alias)),
    ).length;
    if (score > highestScore) {
      highestScore = score;
      headerIndex = index;
    }
  }

  if (headerIndex < 0 || highestScore < 2) {
    return XLSX.utils.sheet_to_json(sheet, { defval: "" });
  }

  const headers = matrix[headerIndex].map((cell) => String(cell ?? "").trim());
  return matrix
    .slice(headerIndex + 1)
    .map((cells) =>
      Object.fromEntries(
        headers.flatMap((header, column) =>
          header ? [[header, cells[column] ?? ""]] : [],
        ),
      ),
    );
}

function parseKml(text: string): Record<string, unknown>[] {
  const document = new DOMParser().parseFromString(text, "application/xml");
  if (document.querySelector("parsererror")) {
    throw new Error("This KML file could not be read.");
  }

  return Array.from(document.getElementsByTagNameNS("*", "Placemark")).map(
    (placemark) => {
      const record: Record<string, unknown> = {
        Name: placemark.getElementsByTagNameNS("*", "name")[0]?.textContent,
        Description: placemark.getElementsByTagNameNS("*", "description")[0]
          ?.textContent,
      };
      for (const field of Array.from(
        placemark.getElementsByTagNameNS("*", "SimpleData"),
      )) {
        const name = field.getAttribute("name");
        if (name) record[name] = field.textContent;
      }
      for (const field of Array.from(
        placemark.getElementsByTagNameNS("*", "Data"),
      )) {
        const name = field.getAttribute("name");
        const value = field.getElementsByTagNameNS("*", "value")[0]
          ?.textContent;
        if (name) record[name] = value;
      }
      return record;
    },
  );
}

export async function readStockFile(file: File): Promise<StockRow[]> {
  const extension = file.name.split(".").pop()?.toLowerCase();
  let records: Record<string, unknown>[];

  if (extension === "kmz") {
    const files = unzipSync(new Uint8Array(await file.arrayBuffer()));
    const kmlPath = Object.keys(files).find((path) => /\.kml$/i.test(path));
    if (!kmlPath)
      throw new Error("No KML document was found in this KMZ file.");
    records = parseKml(new TextDecoder().decode(files[kmlPath]));
  } else if (extension === "kml") {
    records = parseKml(await file.text());
  } else if (extension === "json") {
    const value: unknown = JSON.parse(await file.text());
    if (Array.isArray(value)) records = value as Record<string, unknown>[];
    else if (
      value &&
      typeof value === "object" &&
      "rows" in value &&
      Array.isArray(value.rows)
    ) {
      records = value.rows as Record<string, unknown>[];
    } else {
      throw new Error(
        "JSON must contain an array of stock records or a rows array.",
      );
    }
  } else if (["csv", "tsv", "xls", "xlsx"].includes(extension ?? "")) {
    const workbook = XLSX.read(new Uint8Array(await file.arrayBuffer()), {
      type: "array",
    });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    if (!sheet) throw new Error("No worksheet was found in this file.");
    records = recordsFromSheet(sheet);
  } else {
    throw new Error("Choose a CSV, TSV, Excel, JSON, KML, or KMZ file.");
  }

  const rows = records.flatMap((record): StockRow[] => {
    const values = Object.fromEntries(
      Object.entries(fieldAliases).map(([field, aliases]) => [
        field,
        readField(record, aliases),
      ]),
    ) as Record<keyof Omit<StockRow, "id">, unknown>;

    const mtnCode = String(values.mtnCode ?? "").trim();
    const name = String(values.name ?? "").trim();

    // 1. Only require mtnCode and name (Prisma enforces mtnCode as unique)
    if (!mtnCode || !name) return [];

    const rawQuantity = String(values.available ?? "0").replace(/,/g, "");
    const available = Number.parseInt(rawQuantity.replace(/[^\d-]/g, ""), 10);
    return [
      {
        id: crypto.randomUUID(),
        mtnCode,
        ifsCode: String(values.ifsCode ?? "").trim(),
        partNumber: String(values.partNumber ?? "").trim(),
        name,
        description: String(values.description ?? "").trim(),
        available: Number.isFinite(available) ? available : 0,
        dateSynced:
          String(values.dateSynced ?? "").trim() ||
          new Date().toISOString().split("T")[0],
      },
    ];
  });

  if (!rows.length) {
    const detected = records[0] ? Object.keys(records[0]) : [];
    const missing = (["mtnCode", "name"] as const).filter(
      (field) =>
        !detected.some((header) =>
          fieldAliases[field].includes(normalizeHeader(header)),
        ),
    );
    const expected: Record<(typeof missing)[number], string> = {
      mtnCode: "Item Code",
      name: "Name or Description",
    };
    if (missing.length) {
      throw new Error(
        `Required columns not detected: ${missing.map((field) => expected[field]).join(", ")}. Check the header row in your file.`,
      );
    }
    throw new Error("No stock rows found below the detected header row.");
  }
  return rows;
}

function usePageActions({
  setHeaderActions,
  filtersVisible,
  setFiltersVisible,
  setImportOpen,
  query,
  message,
}: {
  setHeaderActions: ReturnType<typeof usePageHeaderActions>["setActions"];
  filtersVisible: boolean;
  setFiltersVisible: (fn: (v: boolean) => boolean) => void;
  setImportOpen: (v: boolean) => void;
  query: ReturnType<typeof useEquipmentList>;
  message: ReturnType<typeof App.useApp>["message"];
}) {
  useEffect(() => {
    setHeaderActions({
      desktop: (
        <>
          <Button
            aria-pressed={filtersVisible}
            icon={<Filter size={15} />}
            onClick={() => setFiltersVisible((v) => !v)}
            size="small"
          >
            Filters
          </Button>
          <Button
            icon={<RotateCw size={15} />}
            loading={query.isFetching}
            onClick={() =>
              query.refetch().catch((e) => message.error(String(e)))
            }
            size="small"
          >
            Refresh
          </Button>
          <Button
            loading={query.isFetching}
            onClick={() => setImportOpen(true)}
            size="small"
            type="primary"
          >
            <Upload size={14} /> Import Stock
          </Button>
        </>
      ),
      mobile: (
        <Dropdown
          menu={{
            items: [
              { key: "filters", label: "Filters", icon: <Filter size={14} /> },
              {
                key: "refresh",
                label: "Refresh",
                icon: <RotateCw size={14} />,
              },
              {
                key: "import",
                label: "Import Stock",
                icon: <Upload size={14} />,
              },
            ],
            onClick: ({ key }) => {
              if (key === "filters") setFiltersVisible((value) => !value);
              if (key === "refresh") {
                void query
                  .refetch()
                  .catch((error) => message.error(String(error)));
              }
              if (key === "import") setImportOpen(true);
            },
          }}
          placement="bottomRight"
          trigger={["click"]}
        >
          <Button aria-label="Stock actions" icon={<Upload size={16} />} />
        </Dropdown>
      ),
    });
    return () => setHeaderActions(null);
  }, [
    filtersVisible,
    query.isFetching,
    query.refetch,
    setHeaderActions,
    setFiltersVisible,
    setImportOpen,
    message,
  ]);
}

/* -------------------------------------------------------------------------- */
/*                                    EMRF                                    */
/* -------------------------------------------------------------------------- */

const EMRF_PAGE_SIZE = 20;

// the summary cards double as the status filter
type EmrfSubset =
  | "TOTAL"
  | typeof EmrfStatus.REQUESTED
  | typeof EmrfStatus.APPROVED
  | typeof EmrfStatus.CANCELLED;

const emrfSubsets: { key: EmrfSubset; label: string }[] = [
  { key: "TOTAL", label: m.subset_total() },
  { key: EmrfStatus.REQUESTED, label: statusName(EmrfStatus.REQUESTED) },
  { key: EmrfStatus.APPROVED, label: statusName(EmrfStatus.APPROVED) },
  { key: EmrfStatus.CANCELLED, label: statusName(EmrfStatus.CANCELLED) },
];

/** `offset` is how many rows come before this page, so S/N runs on. */
const emrfColumns = (offset: number): TableColumnsType<EmrfRow> => [
  {
    title: "S/N",
    width: 64,
    fixed: "left",
    align: "center",
    render: (_, __, index) => (
      <span className="tabular-nums opacity-70">{offset + index + 1}</span>
    ),
  },
  {
    title: "Job",
    align: "center",
    width: 260,
    ellipsis: true,
    render: (_, emrf) => emrfJobName(emrf) ?? "–",
  },
  {
    title: "Vendor",
    align: "center",
    width: 180,
    ellipsis: true,
    render: (_, emrf) => emrfVendor(emrf) ?? "–",
  },
  {
    title: "Status",
    align: "center",
    dataIndex: "status",
    width: 120,
    render: (status: EmrfStatus) => <StatusBadge status={status} />,
  },
  {
    title: "Segment",
    align: "center",
    width: 200,
    ellipsis: true,
    render: (_, emrf) => emrfSegments(emrf),
  },
  {
    title: "Items",
    width: 80,
    align: "center",
    render: (_, emrf) => emrf.items.length,
  },
  {
    title: "Quantity",
    width: 100,
    align: "center",
    render: (_, emrf) => emrfTotal(emrf),
  },
  {
    title: "Actions",
    width: 80,
    align: "center",
    fixed: "right",
    render: (_, emrf) => <ActionsButton actions={emrfActions} item={emrf} />,
  },
];

// clicks on the actions button or its menu must not also open the drawer
function isActionClick(event: MouseEvent) {
  const target = event.target as HTMLElement;
  return !!target.closest("button, .ant-dropdown");
}

function emrfSearchText(emrf: EmrfRow) {
  const job = emrf.survey?.work;
  const parts = [emrf.id, job?.sid ?? "", job?.name ?? ""];
  parts.push(emrfVendor(emrf) ?? "");
  for (const item of emrf.items) {
    const e = item.equipment;
    parts.push(item.segment, e.name, e.mtnCode, e.ifsCode ?? "");
    parts.push(e.partNumber ?? "");
  }
  return parts.join(" ").toLowerCase();
}

export function EmrfPage() {
  const { setActions: setHeaderActions } = usePageHeaderActions();
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<Exclude<EmrfSubset, "TOTAL">>();
  const [page, setPage] = useState(1);
  const modals = useModalViewer();
  const query = useEmrfList({ status, page, pageSize: EMRF_PAGE_SIZE });
  const counts = useEmrfCounts();

  // search narrows the page loaded from the server
  const filteredRows = useMemo(() => {
    const rows = query.data?.items ?? [];
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) return rows;
    return rows.filter((row) => emrfSearchText(row).includes(normalizedSearch));
  }, [query.data, search]);

  useEffect(() => {
    setHeaderActions({
      desktop: (
        <>
          <Button
            aria-pressed={filtersVisible}
            icon={<Filter size={15} />}
            onClick={() => setFiltersVisible((visible) => !visible)}
            size="small"
          >
            Filters
          </Button>
          <Button
            icon={<RotateCw size={15} />}
            loading={query.isFetching}
            onClick={() => void query.refetch()}
            size="small"
          >
            Refresh
          </Button>
          <Button
            onClick={() => setCreateOpen(true)}
            size="small"
            type="primary"
          >
            New EMRF
          </Button>
        </>
      ),
      mobile: (
        <Dropdown
          menu={{
            items: [
              { key: "filters", label: "Filters", icon: <Filter size={14} /> },
              {
                key: "refresh",
                label: "Refresh",
                icon: <RotateCw size={14} />,
              },
              { key: "new", label: "New EMRF", icon: <Upload size={14} /> },
            ],
            onClick: ({ key }) => {
              if (key === "filters") setFiltersVisible((visible) => !visible);
              if (key === "refresh") void query.refetch();
              if (key === "new") setCreateOpen(true);
            },
          }}
          placement="bottomRight"
          trigger={["click"]}
        >
          <Button aria-label="EMRF actions" icon={<Upload size={16} />} />
        </Dropdown>
      ),
    });
    return () => setHeaderActions(null);
  }, [filtersVisible, query.isFetching, query.refetch, setHeaderActions]);

  return (
    <main className="flex h-full min-h-0 flex-col gap-3 px-4 py-4 md:px-6">
      <SubsetCards<EmrfSubset>
        counts={counts.data}
        items={emrfSubsets}
        onSelect={(key) => {
          setStatus(key === "TOTAL" ? undefined : key);
          setPage(1);
        }}
        selected={status ?? "TOTAL"}
      />
      {filtersVisible && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-6">
          <Input
            allowClear
            className="xl:col-span-2"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search job, vendor, segment, item, code or EMRF ID"
            value={search}
          />
        </div>
      )}
      <Table<EmrfRow>
        columns={emrfColumns((page - 1) * EMRF_PAGE_SIZE)}
        dataSource={filteredRows}
        loading={query.isLoading}
        locale={{ emptyText: "No EMRFs yet" }}
        pagination={{
          current: page,
          pageSize: EMRF_PAGE_SIZE,
          total: query.data?.pagination.total,
          showSizeChanger: false,
          onChange: setPage,
        }}
        onRow={(emrf) => ({
          className: "cursor-pointer",
          onClick: (event) => {
            if (!isActionClick(event)) modals.openWith(EmrfDetailsDrawer, emrf);
          },
        })}
        rowKey="id"
        scroll={{ x: 1300, y: Math.max(300, window.innerHeight - 360) }}
        size="small"
      />
      <NewEmrfModal onClose={() => setCreateOpen(false)} open={createOpen} />
    </main>
  );
}
