import { Layout } from "antd";
import UserContent from "./UserContent";
import { UserMenu } from "./UserMenu";
import { useUserLayout } from "./useUserLayout";

export default function UserLayout() {
  const props = useUserLayout();

  return (
    <Layout className="w-dvw h-dvh overflow-hidden">
      <UserMenu {...props} />
      <UserContent {...props} />
    </Layout>
  );
}
