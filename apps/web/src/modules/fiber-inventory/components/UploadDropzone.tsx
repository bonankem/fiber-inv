import { FileExcelOutlined, InboxOutlined } from "@ant-design/icons";
import { Button, Card, Space, Typography, Upload } from "antd";

interface UploadDropzoneProps {
  onFileProcess: (file: File) => void;
  excelFile: File | null;
  onClearExcel: () => void;
}

export default function UploadDropzone({
  onFileProcess,
  excelFile,
  onClearExcel,
}: UploadDropzoneProps) {
  return (
    <div className="flex flex-col gap-3">
      <Upload.Dragger
        accept=".kmz,.kml,.xlsx,.xls,.csv"
        multiple
        showUploadList={false}
        beforeUpload={(file) => {
          onFileProcess(file);
          return false;
        }}
        className="p-6 bg-black/[0.02] dark:bg-white/[0.02] rounded-xl border-dashed border-2 hover:border-[#ffcb05]! transition-all cursor-pointer"
      >
        <div className="flex flex-col items-center justify-center gap-2 py-4">
          <div className="w-14 h-14 rounded-full bg-yellow-500/10 flex items-center justify-center text-[#ffcb05] text-2xl mb-1 shadow-sm">
            <InboxOutlined />
          </div>
          <Typography.Text strong className="text-sm">
            Click or drag files to this area to upload
          </Typography.Text>
          <Typography.Text
            type="secondary"
            className="text-xs max-w-sm text-center leading-relaxed"
          >
            Drop a <strong>.KMZ / .KML</strong> network map to preview features
            on the map, and an optional companion <strong>.XLSX / .CSV</strong>{" "}
            site coordinate list.
          </Typography.Text>
        </div>
      </Upload.Dragger>

      {excelFile && (
        <Card
          size="small"
          className="border-green-500/40 bg-green-500/5 dark:bg-green-500/10"
        >
          <div className="flex items-center justify-between">
            <Space>
              <div className="p-2 rounded bg-green-500/20 text-green-600 dark:text-green-400">
                <FileExcelOutlined className="text-lg" />
              </div>
              <div>
                <Typography.Text strong className="text-xs block">
                  {excelFile.name}
                </Typography.Text>
                <Typography.Text type="secondary" className="text-[11px]">
                  {(excelFile.size / 1024).toFixed(1)} KB · Companion
                  spreadsheet staged
                </Typography.Text>
              </div>
            </Space>
            <Button size="small" type="text" danger onClick={onClearExcel}>
              Remove
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
