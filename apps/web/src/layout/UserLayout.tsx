import { APIProvider } from "@vis.gl/react-google-maps";
import { Button, Card, Layout, Spin } from "antd";
import { useEffect, useState } from "react";
import { IoEvent } from "schema/auth";
import { io } from "socket.io-client";
import AuthProvider from "#/api/AuthProvider";
import { apiBaseUrl } from "#/api/helpers";
import { ModalProvider } from "#/providers/ModalProvider";
import UploaderProvider from "#/providers/UploaderProvider";
import { useSessionCheck } from "#/utils/session";
import InactivityModal from "./InactivityModal";
import UserContent from "./UserContent";
import { UserMenu } from "./UserMenu";
import { useOnActivity } from "./useOnActivity";
import { useUserLayout } from "./useUserLayout";

const gMapsKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;

const socket = io(apiBaseUrl, {
  autoConnect: false,
  auth: (cb) => cb({ token: AuthProvider.fetchToken() }),
});

export default function UserLayout() {
  const props = useUserLayout();
  const session = useSessionCheck();
  const [nextCheck, setNextCheck] = useState<number>();

  useEffect(() => {
    if (nextCheck) session.refetch();
  }, [nextCheck, session]);

  useEffect(() => {
    if (session.token) {
      socket.connect();
    }

    function onConnect() {
      console.log("IO connected");
    }

    function onDisconnect() {
      console.log("IO disconnected");
    }

    function onMessage(value: string) {
      console.log("IO message", value);
      const parts = value.split(":");
      const event = parts[0] as IoEvent;
      if (event === IoEvent.NEW_SESSION) {
        setNextCheck(Date.now());
      }
    }

    function onError(e: Error) {
      console.log("IO error", e.message);
    }

    socket.on("connect", onConnect);
    socket.on("connect_error", onError);
    socket.on("disconnect", onDisconnect);
    socket.on("message", onMessage);

    return () => {
      socket.off("connect", onConnect);
      socket.off("connect_error", onError);
      socket.off("disconnect", onDisconnect);
      socket.off("message", onMessage);
      socket.disconnect();
    };
  }, [session.token]);

  const { timeLeft } = useOnActivity();

  return (
    <APIProvider apiKey={gMapsKey}>
      <UploaderProvider>
        <ModalProvider>
          {session.user ? (
            <Layout className="w-dvw h-dvh overflow-hidden">
              <UserMenu {...props} />
              <UserContent {...props} />
              <InactivityModal timeLeft={timeLeft} />
            </Layout>
          ) : session.loading ? (
            <Spin fullscreen />
          ) : (
            <div className="w-dvw h-dvh flex items-center justify-center">
              <Card classNames={{ body: "flex flex-col items-center gap-4" }}>
                <p>Error loading page</p>
                <Button
                  size="small"
                  type="primary"
                  onClick={() => session.refetch()}
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
