import { Outlet } from "@tanstack/react-router";
import { Card } from "antd";
import { twJoin } from "tailwind-merge";
import CopyrightFooter from "#/components/CopyrightFooter";
import MtnLogo from "#/components/MtnLogo";
import { useAppTheme } from "#/theme";

export default function AuthLayout() {
  const { isDark } = useAppTheme();

  return (
    <div
      id={isDark ? "dark-mode" : "light-mode"}
      className={twJoin(
        "full-screen centered relative",
        isDark ? "bg-[#202020] text-white" : "bg-gray-100",
      )}
    >
      <footer className="absolute bottom-4">
        <CopyrightFooter />
      </footer>
      <div className="w-full max-w-sm m-auto pb-20">
        <MtnLogo className="mx-16 my-8 text-[#ffcb05]" />
        <Card>
          <Outlet />
        </Card>
      </div>
    </div>
  );
}
