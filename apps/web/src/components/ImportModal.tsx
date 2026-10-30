import type { TableColumnsType, UploadFile } from "antd";
import {
    Alert,
    App,
    Button,
    Modal,
    Spin,
    Table,
    Upload as UploadComponent,
} from "antd";
import { Download, FileSpreadsheet, Upload } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";

export type ImportModalProps<T> = {
  open: boolean;
  title: string;
  hint: string;
  accept: string;
  /** Parse a file into rows. Throw to surface an error in the modal. */
  parse: (file: File) => Promise<T[]>;
  columns: TableColumnsType<T>;
  rowKey: (row: T) => string;
  /** Called with the parsed rows when the user clicks Import. */
  onImport: (rows: T[]) => Promise<void> | void;
  onClose: () => void;
  importLabel?: string;
  /** Optional: URL to a downloadable CSV template */
  templateUrl?: string;
};

export function ImportModal<T>({
  open,
  title,
  hint,
  accept,
  parse,
  columns,
  rowKey,
  onImport,
  onClose,
  importLabel = "Import",
  templateUrl,
}: ImportModalProps<T>) {
  const { message } = App.useApp();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [rows, setRows] = useState<T[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Reset when reopened
  useEffect(() => {
    if (!open) return;
    setFileList([]);
    setRows(null);
    setError(null);
    setParsing(false);
    setImporting(false);
  }, [open]);

  async function onBeforeUpload(picked: File) {
    setFileList([
      { uid: picked.name, name: picked.name, status: "done", size: picked.size },
    ]);
    setRows(null);
    setError(null);
    setParsing(true);
    try {
      const parsed = await parse(picked);
      setRows(parsed);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not parse this file.");
    } finally {
      setParsing(false);
    }
    return false;
  }

  function reset() {
    setFileList([]);
    setRows(null);
    setError(null);
  }

  async function confirm() {
    if (!rows) return;
    setImporting(true);
    try {
      await onImport(rows);
    } catch (e) {
      message.error(
        e instanceof Error ? e.message : "Could not import these rows.",
      );
    } finally {
      setImporting(false);
    }
  }

  const previewData = useMemo(() => (rows ? rows.slice(0, 8) : []), [rows]);

  const footer: ReactNode = (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-gray-500">
        {rows
          ? `Parsed ${rows.length} row${rows.length === 1 ? "" : "s"}`
          : error
            ? "Fix the file to continue"
            : parsing
              ? "Parsing…"
              : "Choose a file to continue"}
      </span>
      <div className="flex gap-2">
        <Button onClick={onClose} disabled={importing}>
          Cancel
        </Button>
        <Button
          disabled={!rows || parsing || importing}
          loading={importing}
          onClick={confirm}
          type="primary"
        >
          {importLabel}
        </Button>
      </div>
    </div>
  );

  return (
    <Modal
      destroyOnClose
      footer={footer}
      maskClosable={!importing}
      onCancel={importing ? undefined : onClose}
      open={open}
      title={title}
      width={800}
    >
      <div className="flex flex-col gap-3">
        {/* Header hint & Template download */}
        <div className="flex items-start justify-between gap-4">
          <p className="m-0 text-sm text-gray-500 max-w-xl">{hint}</p>
          {templateUrl && (
            <a 
              href={templateUrl} 
              download 
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 whitespace-nowrap"
            >
              <Download size={14} /> Download template
            </a>
          )}
        </div>

        <UploadComponent.Dragger
          accept={accept}
          beforeUpload={onBeforeUpload}
          fileList={fileList}
          maxCount={1}
          onChange={({ fileList }) => {
            if (fileList.length === 0) reset();
            else setFileList(fileList.slice(-1));
          }}
          onRemove={() => {
            reset();
            return true;
          }}
          showUploadList={{ showPreviewIcon: false, showRemoveIcon: !importing }}
        >
          <div className="flex flex-col items-center gap-1 py-4">
            <Upload size={26} className="text-gray-400" />
            <p className="m-0 text-sm font-medium">
              Click or drag a file here
            </p>
            <p className="m-0 text-xs text-gray-500">{accept}</p>
          </div>
        </UploadComponent.Dragger>

        {parsing && (
          <div className="flex items-center justify-center gap-2 rounded border border-dashed py-6 text-sm text-gray-500">
            <Spin size="small" /> Parsing file…
          </div>
        )}

        {!parsing && error && (
          <Alert
            showIcon
            type="error"
            message="Could not read the file"
            description={error}
          />
        )}

        {!parsing && !error && rows && rows.length > 0 && (
          <div className="rounded border">
            <div className="flex items-center justify-between border-b bg-gray-50 px-3 py-2 text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <FileSpreadsheet size={14} />
                Preview
              </span>
              <span>
                Showing {previewData.length} of {rows.length}
              </span>
            </div>
            <Table<T>
              columns={columns}
              dataSource={previewData}
              pagination={false}
              rowKey={rowKey}
              scroll={{ x: true, y: 240 }}
              size="small"
            />
          </div>
        )}

        {!parsing && !error && rows && rows.length === 0 && (
          <Alert
            showIcon
            type="warning"
            message="No rows found"
            description="The file was read but contained no importable rows."
          />
        )}
      </div>
    </Modal>
  );
}