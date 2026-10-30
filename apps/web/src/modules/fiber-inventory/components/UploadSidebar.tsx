import {
  CheckCircleOutlined,
  FileExcelOutlined,
  NodeIndexOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { Button, Card, Space, Spin, Tag, Typography, Upload } from "antd";
import type { KmzPreviewData, SpreadsheetPreviewData } from "../utils/types";

interface UploadSidebarProps {
  kmzData: KmzPreviewData;
  spreadsheetData: SpreadsheetPreviewData | null;
  excelFile: File | null;
  parsingCsv: boolean;
  onClearKmz: () => void;
  onClearExcel: () => void;
  onFileProcess: (file: File) => void;
}

export default function UploadSidebar({
  kmzData,
  spreadsheetData,
  excelFile,
  parsingCsv,
  onClearKmz,
  onClearExcel,
  onFileProcess,
}: UploadSidebarProps) {
  return (
    <div className="flex flex-col gap-3 justify-between">
      <div className="flex flex-col gap-3">
        <Typography.Text
          strong
          className="text-xs uppercase tracking-wider text-zinc-500"
        >
          Source Files
        </Typography.Text>

        {/* KMZ Network Map Card */}
        <Card
          size="small"
          className="border-yellow-500/40 bg-yellow-500/5 dark:bg-yellow-500/10 shadow-xs"
        >
          <div className="flex items-start justify-between">
            <Space align="start">
              <div className="p-2 rounded bg-yellow-500/20 text-[#ffcb05] mt-0.5">
                <NodeIndexOutlined className="text-base" />
              </div>
              <div>
                <Typography.Text strong className="text-xs block">
                  {kmzData.fileName}
                </Typography.Text>
                <Typography.Text type="secondary" className="text-[11px] block">
                  {(kmzData.fileSize / (1024 * 1024)).toFixed(2)} MB · KMZ
                  Network Map
                </Typography.Text>
                <div className="flex flex-wrap gap-1 mt-2">
                  <Tag color="gold" className="text-[10px] m-0">
                    {kmzData.summary.polygons} Zones
                  </Tag>
                  <Tag color="blue" className="text-[10px] m-0">
                    {kmzData.summary.lines} Routes
                  </Tag>
                  <Tag color="green" className="text-[10px] m-0">
                    {kmzData.summary.points} Points
                  </Tag>
                </div>
              </div>
            </Space>
            <Button
              size="small"
              type="text"
              danger
              onClick={onClearKmz}
              className="text-xs"
            >
              Clear
            </Button>
          </div>
        </Card>

        {/* Companion Spreadsheet Section */}
        {excelFile ? (
          <Spin spinning={parsingCsv} tip="Parsing site coordinates...">
            <Card
              size="small"
              className="border-green-500/40 bg-green-500/5 dark:bg-green-500/10 shadow-xs"
            >
              <div className="flex items-start justify-between">
                <Space align="start">
                  <div className="p-2 rounded bg-green-500/20 text-green-600 dark:text-green-400 mt-0.5">
                    <FileExcelOutlined className="text-base" />
                  </div>
                  <div>
                    <Typography.Text strong className="text-xs block">
                      {excelFile.name}
                    </Typography.Text>
                    <Typography.Text
                      type="secondary"
                      className="text-[11px] block"
                    >
                      {(excelFile.size / 1024).toFixed(1)} KB · Real-time
                      spreadsheet
                    </Typography.Text>

                    {spreadsheetData && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        <Tag
                          color="cyan"
                          className="text-[10px] m-0 flex items-center gap-1"
                        >
                          <CheckCircleOutlined />
                          {spreadsheetData.sites.length} Sites Detected
                        </Tag>
                        <Tag color="success" className="text-[10px] m-0">
                          {spreadsheetData.matchedCount} Matched
                        </Tag>
                        {spreadsheetData.unmatchedCount > 0 && (
                          <Tag color="warning" className="text-[10px] m-0">
                            {spreadsheetData.unmatchedCount} Unmatched
                          </Tag>
                        )}
                      </div>
                    )}
                  </div>
                </Space>
                <Button
                  size="small"
                  type="text"
                  danger
                  onClick={onClearExcel}
                  className="text-xs"
                >
                  Remove
                </Button>
              </div>
            </Card>
          </Spin>
        ) : (
          <Upload.Dragger
            accept=".xlsx,.xls,.csv"
            showUploadList={false}
            beforeUpload={(file) => {
              onFileProcess(file);
              return false;
            }}
            className="p-3 border-dashed border-2 rounded-lg bg-black/[0.01] hover:border-green-500! transition-all cursor-pointer"
          >
            <div className="flex items-center justify-center gap-2 py-1">
              <FileExcelOutlined className="text-green-600 text-lg" />
              <div className="text-left">
                <Typography.Text strong className="text-xs block">
                  Attach companion .xlsx / .csv
                </Typography.Text>
                <Typography.Text type="secondary" className="text-[11px] block">
                  Sites will appear on the map in real time
                </Typography.Text>
              </div>
            </div>
          </Upload.Dragger>
        )}
      </div>

      {/* Informational Guidance Banner */}
      <div className="p-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800/50 text-[11px] text-zinc-500 flex items-center gap-2">
        <ReloadOutlined className="text-zinc-400" />
        <span>
          Saving will persist this dataset into inventory and update network
          clusters and site coordinates.
        </span>
      </div>
    </div>
  );
}
