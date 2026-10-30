import { UploadOutlined } from "@ant-design/icons";
import { Map as GoogleMap } from "@vis.gl/react-google-maps";
import { Alert, Button, Empty, Spin, Typography } from "antd";
import { fiberInventoryZ } from "schema/fiber-inventory";
import { useApiGet } from "#/api/helpers";
import { useModalViewer } from "#/hooks/useModalViewer";
import { useAppTheme } from "#/theme";
import KmzMapLayers from "./components/KmzMapLayers";
import FiberUploadModal from "./FiberUploadModal";

export default function FiberInventoryPage() {
  const inventory = useApiGet("fiber-inventory", fiberInventoryZ.nullable());
  const { isDark } = useAppTheme();
  const modal = useModalViewer();
  const items = inventory.data?.items ?? [];
  const sites = inventory.data?.sites ?? [];

  return (
    <div className="w-full h-full min-h-0">
      {inventory.isLoading ? (
        <div className="w-full h-full flex items-center justify-center">
          <Spin />
        </div>
      ) : inventory.isError ? (
        <Alert type="error" message="Could not load fiber inventory." />
      ) : inventory.data?.uploads.length ? (
        <GoogleMap
          defaultCenter={{ lat: 7.5, lng: -5.5 }}
          defaultZoom={6}
          mapTypeId="satellite"
          mapTypeControl
          colorScheme={isDark ? "DARK" : "LIGHT"}
          className="w-full h-full"
        >
          <KmzMapLayers items={items} sites={sites} minPinZoom={11} />
        </GoogleMap>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Empty
            description={
              <div className="flex flex-col gap-3 items-center">
                <div className="flex flex-col gap-1">
                  <Typography.Text strong>
                    No inventory uploaded yet
                  </Typography.Text>
                  <Typography.Text type="secondary">
                    Upload one or more KMZ files and Excel site lists to view
                    matched inventory on the map.
                  </Typography.Text>
                </div>
                <Button
                  type="primary"
                  icon={<UploadOutlined />}
                  onClick={() => modal.open(FiberUploadModal)}
                >
                  Upload KMZ / Excel
                </Button>
              </div>
            }
          />
        </div>
      )}
    </div>
  );
}
