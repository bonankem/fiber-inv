/** biome-ignore-all lint/a11y/useAriaPropsSupportedByRole: allow it here */
import { Outlet, useLocation } from "@tanstack/react-router";
import { Card, Radio } from "antd";
import { getLocale, locales, setLocale } from "i18n/runtime";
import { twJoin } from "tailwind-merge";
import CopyrightFooter from "#/components/CopyrightFooter";
import MtnLogo from "#/components/MtnLogo";
import { useAppTheme } from "#/theme";

export default function AuthLayout() {
  const { isDark } = useAppTheme();
  const canShowLang = useLocation().hash !== "setup";

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
      <div className="w-full max-w-sm m-auto pb-8">
        <MtnLogo className="mx-16 my-8 text-[#ffcb05]" />
        <Card>
          <Outlet />
        </Card>

        {canShowLang && (
          <section className="mt-12 flex justify-center">
            <Radio.Group
              size="small"
              optionType="button"
              options={locales.map((l) => ({
                label: l.toUpperCase(),
                value: l,
              }))}
              value={getLocale()}
              onChange={(e) => setLocale(e.target.value)}
            />
          </section>
        )}
      </div>
    </div>
  );
}
