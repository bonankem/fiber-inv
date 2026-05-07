import { Layout } from "antd";
import { ModalProvider } from "#/components/ModalProvider";
import UploaderProvider from "#/components/UploaderProvider";
import UserContent from "./UserContent";
import { UserMenu } from "./UserMenu";
import { useUserLayout } from "./useUserLayout";

export default function UserLayout() {
  const props = useUserLayout();

  return (
    <UploaderProvider>
      <ModalProvider>
        <Layout className="w-dvw h-dvh overflow-hidden">
          <UserMenu {...props} />
          <UserContent {...props} />
        </Layout>
      </ModalProvider>
    </UploaderProvider>
  );
}
