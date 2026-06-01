import { APIProvider } from "@vis.gl/react-google-maps";
import { Layout } from "antd";
import { ModalProvider } from "#/providers/ModalProvider";
import UploaderProvider from "#/providers/UploaderProvider";
import UserContent from "./UserContent";
import { UserMenu } from "./UserMenu";
import { useUserLayout } from "./useUserLayout";

export default function UserLayout() {
  const props = useUserLayout();

  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_KEY}>
      <UploaderProvider>
        <ModalProvider>
          <Layout className="w-dvw h-dvh overflow-hidden">
            <UserMenu {...props} />
            <UserContent {...props} />
          </Layout>
        </ModalProvider>
      </UploaderProvider>
    </APIProvider>
  );
}
