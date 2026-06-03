import { useNavigate } from "@tanstack/react-router";
import { APIProvider } from "@vis.gl/react-google-maps";
import { Button, Card, Layout, Spin } from "antd";
import { useEffect } from "react";
import { userFullZ } from "schema/people";
import { useAuthToken } from "#/api/auth";
import { isApiError, useApiGet } from "#/api/helpers";
import { ModalProvider } from "#/providers/ModalProvider";
import UploaderProvider from "#/providers/UploaderProvider";
import UserContent from "./UserContent";
import { UserMenu } from "./UserMenu";
import { useUserLayout } from "./useUserLayout";

export default function UserLayout() {
  const props = useUserLayout();
  const token = useAuthToken();
  const authUser = useApiGet("auth/user", userFullZ);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token.value) {
      navigate({ to: "/login" });
    } else if (isApiError(authUser.error, 401)) {
      token.update(null);
      navigate({ to: "/login" });
    }
  }, [token, authUser.error, navigate]);

  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_KEY}>
      <UploaderProvider>
        <ModalProvider>
          {authUser.data ? (
            <Layout className="w-dvw h-dvh overflow-hidden">
              <UserMenu {...props} />
              <UserContent {...props} />
            </Layout>
          ) : authUser.isPending ? (
            <Spin fullscreen />
          ) : (
            <div className="w-dvw h-dvh flex items-center justify-center">
              <Card classNames={{ body: "flex flex-col items-center gap-4" }}>
                <p>Error loading page</p>
                <Button
                  size="small"
                  type="primary"
                  onClick={() => authUser.refetch()}
                >
                  Retry
                </Button>
              </Card>
            </div>
          )}
        </ModalProvider>
      </UploaderProvider>
    </APIProvider>
  );
}
