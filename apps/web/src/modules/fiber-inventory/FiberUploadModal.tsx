import { useQueryClient } from "@tanstack/react-query";
import { Alert, message, Spin } from "antd";
import { useMemo, useState } from "react";
import {
  type FiberInventoryT,
  type FiberSiteT,
  isNoiseLayer,
} from "schema/fiber-inventory";
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
import type { KmzPreviewData } from "./utils/types";

type SheetData = { fileName: string; fileSize: number; sites: FiberSiteT[] };

export default function FiberUploadModal(props: ModalStateProps) {
  const [kmzFile, setKmzFile] = useState<File | null>(null);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [kmzData, setKmzData] = useState<KmzPreviewData | null>(null);
  const [sheet, setSheet] = useState<SheetData | null>(null);
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  const [parsingKmz, setParsingKmz] = useState(false);
  const [parsingCsv, setParsingCsv] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const inventoryUpload = useApiUpload<FiberInventoryT>(
    "fiber-inventory/upload",
  );
  const queryClient = useQueryClient();
  const { isDark } = useAppTheme();

  // what will actually be saved: the kept layers, matched against the sites
  const preview = useMemo(() => {
    const items = (kmzData?.items ?? []).filter(
      (i) => !excluded.has(i.layer ?? ""),
    );
    if (!sheet) return { items, spreadsheet: null };
    const m = matchSitesToItems(sheet.sites, items);
    return {
      items: m.matchedItems,
      spreadsheet: {
        ...sheet,
        sites: m.matchedSites,
        matchedCount: m.matchedCount,
        unmatchedCount: m.unmatchedCount,
      },
    };
  }, [kmzData, excluded, sheet]);

  const fail = (err: unknown, fallback: string) => {
    const msg = err instanceof Error ? err.message : fallback;
    setErrorMsg(msg);
    message.error(msg);
  };

  const handleFileProcess = async (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    setErrorMsg(null);

    if (["kmz", "kml"].includes(ext)) {
      setParsingKmz(true);
      try {
        const data = await parseKmzForPreview(file);
        // drawing-only layers (hatching, legend, title block...) start unticked
        const noise = data.layers.filter((l) => isNoiseLayer(l.name));
        setExcluded(new Set(noise.map((l) => l.name)));
        setKmzFile(file);
        setKmzData(data);
        message.success(
          noise.length
            ? `Parsed ${data.items.length} features; ${noise.length} drawing layers left out`
            : `Parsed ${data.items.length} network features from ${file.name}`,
        );
      } catch (err) {
        fail(err, "Failed to parse KMZ file");
      } finally {
        setParsingKmz(false);
      }
    } else if (["xlsx", "xls", "csv"].includes(ext)) {
      setExcelFile(file);
      setParsingCsv(true);
      try {
        const result = await parseSpreadsheetForPreview(file, []);
        setSheet({
          fileName: result.fileName,
          fileSize: result.fileSize,
          sites: result.sites,
        });
        message.success(`Extracted ${result.sites.length} sites`);
      } catch (err) {
        setExcelFile(null);
        fail(err, "Failed to parse spreadsheet file");
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
    setExcluded(new Set());
  };

  const handleClearExcel = () => {
    setExcelFile(null);
    setSheet(null);
  };

  const onSubmit = async () => {
    if (!kmzFile && !excelFile) {
      message.warning("Please upload at least one KMZ or Excel file");
      return;
    }
    if (kmzFile && !preview.items.length) {
      message.warning("Tick at least one layer to save");
      return;
    }

    setUploading(true);
    try {
      let updated: FiberInventoryT | undefined;
      if (kmzFile) {
        const options = { excludedLayers: [...excluded] };
        updated = await inventoryUpload.mutateAsync({
          file: kmzFile,
          fields: { options: JSON.stringify(options) },
        });
      }
      if (excelFile) {
        updated = await inventoryUpload.mutateAsync(excelFile);
      }
      // The upload already returns the rebuilt inventory; don't download it again.
      await queryClient.cancelQueries({ queryKey: ["fiber-inventory"] });
      if (updated) queryClient.setQueryData(["fiber-inventory"], updated);
      message.success("Fiber inventory uploaded successfully");
      props.state.close();
    } catch (e) {
      showAppError(e);
    } finally {
      setUploading(false);
    }
  };

  return (
    <FormModal
      width={kmzData ? 960 : 480}
      title="Upload Fiber Inventory"
      subtitle={
        kmzData
          ? "Pick the layers to keep, check the preview, then save"
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
          <UploadDropzone
            onFileProcess={handleFileProcess}
            excelFile={excelFile}
            onClearExcel={handleClearExcel}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
            <KmzPreviewMap
              items={preview.items}
              sites={preview.spreadsheet?.sites}
              matchedCount={preview.spreadsheet?.matchedCount}
              fileName={kmzData.fileName}
              spreadsheetName={preview.spreadsheet?.fileName}
              isDark={isDark}
            />

            <UploadSidebar
              kmzData={kmzData}
              keptItems={preview.items}
              excluded={excluded}
              onExcludedChange={setExcluded}
              spreadsheetData={preview.spreadsheet}
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
