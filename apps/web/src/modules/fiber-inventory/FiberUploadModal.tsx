import { useQueryClient } from "@tanstack/react-query";
import { Alert, message, Spin } from "antd";
import { useState } from "react";
import type { FiberInventoryT } from "schema/fiber-inventory";
import { showAppError, useApiUpload } from "#/api/helpers";
import FormModal from "#/components/FormModal";
import type { ModalStateProps } from "#/hooks/useModalViewer";
import { useAppTheme } from "#/theme";
import KmzPreviewMap from "./components/KmzPreviewMap";
import UploadDropzone from "./components/UploadDropzone";
import UploadSidebar from "./components/UploadSidebar";
import {
  matchSitesToItems,
  parseSpreadsheetForPreview,
} from "./utils/csv-preview";
import { parseKmzForPreview } from "./utils/kmz-preview";
import type { KmzPreviewData, SpreadsheetPreviewData } from "./utils/types";

export default function FiberUploadModal(props: ModalStateProps) {
  const [kmzFile, setKmzFile] = useState<File | null>(null);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [kmzData, setKmzData] = useState<KmzPreviewData | null>(null);
  const [spreadsheetData, setSpreadsheetData] =
    useState<SpreadsheetPreviewData | null>(null);
  const [parsingKmz, setParsingKmz] = useState(false);
  const [parsingCsv, setParsingCsv] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const inventoryUpload = useApiUpload<FiberInventoryT>(
    "fiber-inventory/upload",
  );
  const queryClient = useQueryClient();
  const { isDark } = useAppTheme();

  const handleFileProcess = async (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    setErrorMsg(null);

    if (["kmz", "kml"].includes(ext)) {
      setParsingKmz(true);
      try {
        const preview = await parseKmzForPreview(file);

        // If a companion spreadsheet was already loaded, match sites in real time
        if (spreadsheetData?.sites.length) {
          const { matchedSites, matchedItems, matchedCount, unmatchedCount } =
            matchSitesToItems(spreadsheetData.sites, preview.items);
          preview.items = matchedItems;
          setSpreadsheetData({
            ...spreadsheetData,
            sites: matchedSites,
            matchedCount,
            unmatchedCount,
          });
        }

        setKmzFile(file);
        setKmzData(preview);
        message.success(
          `Parsed ${preview.items.length} network features from ${file.name}`,
        );
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Failed to parse KMZ file";
        setErrorMsg(msg);
        message.error(msg);
      } finally {
        setParsingKmz(false);
      }
    } else if (["xlsx", "xls", "csv"].includes(ext)) {
      setExcelFile(file);
      setParsingCsv(true);
      try {
        const sheetResult = await parseSpreadsheetForPreview(
          file,
          kmzData?.items ?? [],
        );
        setSpreadsheetData(sheetResult);

        // Update KMZ items with newly matched site groupings
        if (kmzData) {
          const { matchedItems } = matchSitesToItems(
            sheetResult.sites,
            kmzData.items,
          );
          setKmzData({ ...kmzData, items: matchedItems });
        }

        message.success(
          `Extracted ${sheetResult.sites.length} sites (${sheetResult.matchedCount} matched to network)`,
        );
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : "Failed to parse spreadsheet file";
        setErrorMsg(msg);
        message.error(msg);
      } finally {
        setParsingCsv(false);
      }
    } else {
      message.error(
        "Unsupported file format. Please upload .kmz, .kml, .xlsx, or .csv",
      );
    }
  };

  const handleClearKmz = () => {
    setKmzFile(null);
    setKmzData(null);
    if (spreadsheetData) {
      setSpreadsheetData({
        ...spreadsheetData,
        sites: spreadsheetData.sites.map((s) => ({
          ...s,
          matchedFeature: null,
          matchedKind: null,
          matchedDistance: null,
        })),
        matchedCount: 0,
        unmatchedCount: spreadsheetData.sites.length,
      });
    }
  };

  const handleClearExcel = () => {
    setExcelFile(null);
    setSpreadsheetData(null);
    if (kmzData) {
      setKmzData({
        ...kmzData,
        items: kmzData.items.map((i) => ({ ...i, sites: [] })),
      });
    }
  };

  const onSubmit = async () => {
    if (!kmzFile && !excelFile) {
      message.warning("Please upload at least one KMZ or Excel file");
      return;
    }

    setUploading(true);
    try {
      if (kmzFile) {
        await inventoryUpload.mutateAsync(kmzFile);
      }
      if (excelFile) {
        await inventoryUpload.mutateAsync(excelFile);
      }
      message.success("Fiber inventory uploaded successfully");
      queryClient.invalidateQueries({ queryKey: ["fiber-inventory"] });
      props.state.close();
    } catch (e) {
      showAppError(e);
    } finally {
      setUploading(false);
    }
  };

  return (
    <FormModal
      width={kmzData ? 900 : 480}
      title="Upload Fiber Inventory"
      subtitle={
        kmzData
          ? "Previewing network features & sites on map · Confirm to save"
          : "Upload KMZ network files and Excel site lists"
      }
      state={props.state}
      onSubmit={onSubmit}
      submitting={uploading || parsingKmz || parsingCsv}
      hasOk={Boolean(kmzFile || excelFile)}
      okText={uploading ? "Uploading..." : "Save to Inventory"}
      checkbox={false}
      noDivider={false}
    >
      <Spin spinning={parsingKmz} tip="Extracting KMZ network features...">
        {errorMsg && (
          <Alert
            type="error"
            message={errorMsg}
            showIcon
            closable
            onClose={() => setErrorMsg(null)}
            className="mb-3"
          />
        )}

        {!kmzData ? (
          // Initial Drag & Drop Area
          <UploadDropzone
            onFileProcess={handleFileProcess}
            excelFile={excelFile}
            onClearExcel={handleClearExcel}
          />
        ) : (
          // Split Layout: Map Preview (Left) and Upload Controls (Right)
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
            <KmzPreviewMap
              items={kmzData.items}
              sites={spreadsheetData?.sites}
              matchedCount={spreadsheetData?.matchedCount}
              fileName={kmzData.fileName}
              spreadsheetName={spreadsheetData?.fileName}
              isDark={isDark}
            />

            <UploadSidebar
              kmzData={kmzData}
              spreadsheetData={spreadsheetData}
              excelFile={excelFile}
              parsingCsv={parsingCsv}
              onClearKmz={handleClearKmz}
              onClearExcel={handleClearExcel}
              onFileProcess={handleFileProcess}
            />
          </div>
        )}
      </Spin>
    </FormModal>
  );
}
