import {
  FullscreenExitOutlined,
  FullscreenOutlined,
  NodeIndexOutlined,
} from "@ant-design/icons";
import { Map as GoogleMap } from "@vis.gl/react-google-maps";
import { Button, Tag, Tooltip, Typography } from "antd";
import { useEffect, useState } from "react";
import type { FiberInventoryItemT, FiberSiteT } from "schema/fiber-inventory";
import KmzMapLayers from "./KmzMapLayers";

interface KmzPreviewMapProps {
  items: FiberInventoryItemT[];
  sites?: FiberSiteT[];
  matchedCount?: number;
  fileName?: string;
  spreadsheetName?: string;
  isDark: boolean;
}

export default function KmzPreviewMap({
  items,
  sites = [],
  matchedCount = 0,
  fileName,
  spreadsheetName,
  isDark,
}: KmzPreviewMapProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Close fullscreen on ESC key
  useEffect(() => {
    if (!isFullscreen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  return (
    <>
      {/* Normal Preview Panel */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Typography.Text
              strong
              className="text-xs uppercase tracking-wider text-zinc-500"
            >
              Network Preview
            </Typography.Text>
            <Tag color="warning" className="m-0 text-[11px]">
              {items.length} Features
            </Tag>
            {sites.length > 0 && (
              <Tag color="cyan" className="m-0 text-[11px]">
                {sites.length} Sites ({matchedCount} Matched)
              </Tag>
            )}
          </div>

          <Button
            size="small"
            icon={<FullscreenOutlined />}
            onClick={() => setIsFullscreen(true)}
            className="text-xs flex items-center gap-1.5 font-medium border-zinc-300 dark:border-zinc-700 hover:text-[#ffcb05]! hover:border-[#ffcb05]!"
          >
            Expand Map
          </Button>
        </div>

        {/* Map Container with Visible Floating Expand Button */}
        <div className="relative w-full h-[320px] rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-inner">
          {/* Prominent Expand Icon Button on the Map Canvas */}
          <div className="absolute top-3 right-3 z-30 pointer-events-auto">
            <Tooltip title="Expand preview to full screen" placement="left">
              <Button
                icon={<FullscreenOutlined style={{ fontSize: "16px" }} />}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFullscreen(true);
                }}
                className="!w-9 !h-9 !flex !items-center !justify-center bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 shadow-lg border border-zinc-300 dark:border-zinc-600 rounded-lg hover:!text-[#ffcb05] hover:!border-[#ffcb05] hover:scale-105 transition-all cursor-pointer"
                aria-label="Expand preview to full screen"
              />
            </Tooltip>
          </div>

          <GoogleMap
            defaultCenter={{ lat: 7.5, lng: -5.5 }}
            defaultZoom={7}
            disableDefaultUI
            colorScheme={isDark ? "DARK" : "LIGHT"}
            className="w-full h-full"
          >
            <KmzMapLayers items={items} sites={sites} />
          </GoogleMap>
        </div>
      </div>

      {/* Fullscreen Modal View */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[1050] bg-zinc-950/95 flex flex-col p-4 backdrop-blur-md animate-in fade-in duration-200">
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/20 text-[#ffcb05]">
                <NodeIndexOutlined className="text-lg" />
              </div>
              <div>
                <Typography.Text strong className="text-white text-sm block">
                  {fileName || "KMZ Network Map Preview"}
                </Typography.Text>
                <Typography.Text className="text-zinc-400 text-xs block">
                  {spreadsheetName
                    ? `Companion sites: ${spreadsheetName}`
                    : "Interactive Network Geometry View"}
                </Typography.Text>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <Tag color="gold" className="m-0 text-xs">
                  {items.length} Features
                </Tag>
                {sites.length > 0 && (
                  <>
                    <Tag color="cyan" className="m-0 text-xs">
                      {sites.length} Sites Total
                    </Tag>
                    <Tag color="success" className="m-0 text-xs">
                      {matchedCount} Matched
                    </Tag>
                    {sites.length - matchedCount > 0 && (
                      <Tag color="warning" className="m-0 text-xs">
                        {sites.length - matchedCount} Unmatched
                      </Tag>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Legend */}
              <div className="hidden sm:flex items-center gap-3 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#ffcb05] inline-block" />
                  KMZ Features
                </span>
                {sites.length > 0 && (
                  <>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
                      Matched Site
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
                      Unmatched Site
                    </span>
                  </>
                )}
              </div>

              <Button
                type="default"
                icon={<FullscreenExitOutlined />}
                onClick={() => setIsFullscreen(false)}
                className="bg-zinc-800 border-zinc-700 text-white hover:text-[#ffcb05]! hover:border-[#ffcb05]!"
              >
                Exit Fullscreen (Esc)
              </Button>
            </div>
          </div>

          {/* Fullscreen Map Canvas */}
          <div className="flex-1 relative mt-3 rounded-xl overflow-hidden border border-zinc-800 shadow-2xl">
            {/* Collapse button on fullscreen map top-right */}
            <div className="absolute top-3 right-3 z-30 pointer-events-auto">
              <Tooltip title="Exit fullscreen (Esc)" placement="left">
                <Button
                  icon={<FullscreenExitOutlined style={{ fontSize: "16px" }} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFullscreen(false);
                  }}
                  className="!w-9 !h-9 !flex !items-center !justify-center bg-zinc-800/90 text-white shadow-lg border border-zinc-700 rounded-lg hover:!text-[#ffcb05] hover:!border-[#ffcb05] hover:scale-105 transition-all cursor-pointer"
                  aria-label="Exit fullscreen"
                />
              </Tooltip>
            </div>

            <GoogleMap
              defaultCenter={{ lat: 7.5, lng: -5.5 }}
              defaultZoom={7}
              colorScheme="DARK"
              className="w-full h-full"
            >
              <KmzMapLayers items={items} sites={sites} />
            </GoogleMap>
          </div>
        </div>
      )}
    </>
  );
}
