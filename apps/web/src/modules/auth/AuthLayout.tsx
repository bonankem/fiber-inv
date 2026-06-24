/** biome-ignore-all lint/a11y/useAriaPropsSupportedByRole: allow it here */
import { Outlet, useLocation } from "@tanstack/react-router";
import { Card } from "antd";
import { twJoin } from "tailwind-merge";
import CopyrightFooter from "#/components/CopyrightFooter";
import MtnLogo from "#/components/MtnLogo";
import { useAppTheme } from "#/theme";

export default function AuthLayout() {
  const { isDark } = useAppTheme();
  const wider = useLocation().pathname === "/forgot";

  return (
    <div
      id={isDark ? "dark-mode" : "light-mode"}
      className={twJoin(
        "full-screen flex flex-col items-center",
        isDark ? "bg-[#202020] text-white" : "bg-gray-100",
      )}
    >
      <main
        className={twJoin(
          "w-full pb-8 grow flex flex-col justify-center",
          wider ? "max-w-md" : "max-w-sm",
        )}
      >
        <MtnLogo className="max-w-40 mx-auto my-6 text-[#ffcb05]" />
        <Card>
          <Outlet />
        </Card>
      </main>

      <footer className="my-4">
        <CopyrightFooter />
      </footer>
    </div>
  );
}
