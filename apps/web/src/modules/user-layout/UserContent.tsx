import { Outlet } from "@tanstack/react-router";
import { Layout } from "antd";
import { useEffect } from "react";
import CopyrightFooter from "#/components/CopyrightFooter";
import UserHeader from "./UserHeader";
import type { UserLayoutProps } from "./useUserLayout";

function setPageTitle(...parts: string[]) {
  document.title = parts.join(" | ");
}

const year = new Date().getFullYear();

export default function UserContent(props: UserLayoutProps) {
  const title = props.title;
  useEffect(() => {
    setPageTitle(title, "ServiceX");
    return () => setPageTitle("ServiceX");
  }, [title]);

  return (
    <Layout>
      <UserHeader {...props} />

      <Layout.Content>
        <main className={props.contentClass}>
          <Outlet />
        </main>
      </Layout.Content>

      <Layout.Footer className="m-0! p-2! text-center">
        <CopyrightFooter />
      </Layout.Footer>
    </Layout>
  );
}
