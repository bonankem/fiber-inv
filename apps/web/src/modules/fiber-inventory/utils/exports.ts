import * as XLSX from "@e965/xlsx";
import JSZip from "jszip";
import type { FiberSiteT } from "schema/fiber-inventory";

const stamp = () => new Date().toISOString().slice(0, 10);

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function rows(sites: FiberSiteT[]) {
  return [...sites]
    .sort(
      (a, b) =>
        a.locality.localeCompare(b.locality) ||
        (a.nearestDistance ?? Infinity) - (b.nearestDistance ?? Infinity),
    )
    .map((s) => ({
      Code: s.code,
      "Site Name": s.siteName,
      Locality: s.locality,
      Latitude: s.lat,
      Longitude: s.lng,
      "Nearest Network": s.nearestFeature ?? "",
      "Distance (m)": s.nearestDistance ?? "",
    }));
}

/** Unmatched sites as a planning list, closest to the network first */
export function exportSitesXlsx(sites: FiberSiteT[], label = "unmatched") {
  const ws = XLSX.utils.json_to_sheet(rows(sites));
  ws["!cols"] = [14, 36, 18, 11, 11, 36, 12].map((wch) => ({ wch }));
  ws["!autofilter"] = { ref: ws["!ref"] ?? "A1" };
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sites");
  const out = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  download(
    new Blob([out], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    `fiber-${label}-sites-${stamp()}.xlsx`,
  );
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** The same list as a KMZ, one placemark per site, foldered by locality */
export async function exportSitesKmz(sites: FiberSiteT[], label = "unmatched") {
  const byLocality = new Map<string, FiberSiteT[]>();
  for (const s of sites) {
    const list = byLocality.get(s.locality) ?? [];
    list.push(s);
    byLocality.set(s.locality, list);
  }
  const folders = [...byLocality]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([locality, list]) => {
      const marks = list.map((s) => {
        const near = s.nearestFeature
          ? `Nearest network: ${s.nearestFeature} (${s.nearestDistance} m)`
          : "No network";
        return `<Placemark><name>${esc(s.code)}</name><description>${esc(`${s.siteName}\n${near}`)}</description><styleUrl>#site</styleUrl><ExtendedData><Data name="Site Name"><value>${esc(s.siteName)}</value></Data><Data name="Nearest Network"><value>${esc(s.nearestFeature ?? "")}</value></Data><Data name="Distance (m)"><value>${s.nearestDistance ?? ""}</value></Data></ExtendedData><Point><coordinates>${s.lng},${s.lat},0</coordinates></Point></Placemark>`;
      });
      return `<Folder><name>${esc(locality)}</name>${marks.join("")}</Folder>`;
    });
  const kml = `<?xml version="1.0" encoding="UTF-8"?><kml xmlns="http://www.opengis.net/kml/2.2"><Document><name>Fiber inventory - ${label} sites (${stamp()})</name><Style id="site"><IconStyle><Icon><href>http://maps.google.com/mapfiles/kml/paddle/orange-diamond.png</href></Icon></IconStyle></Style>${folders.join("")}</Document></kml>`;

  const zip = new JSZip();
  zip.file("doc.kml", kml);
  download(
    await zip.generateAsync({ type: "blob", compression: "DEFLATE" }),
    `fiber-${label}-sites-${stamp()}.kmz`,
  );
}
