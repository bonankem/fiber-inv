import { App, ConfigProvider, type ThemeConfig, theme } from "antd";
import antdEn from "antd/es/locale/en_GB";
import antdFr from "antd/es/locale/fr_FR";
import dayjs from "dayjs";
import "dayjs/locale/en";
import "dayjs/locale/fr";
import { getLocale } from "i18n/runtime";
import {
  createContext,
  type PropsWithChildren,
  use,
  useEffect,
  useState,
} from "react";

const locale = getLocale();
const antLocale = locale === "fr" ? antdFr : antdEn;

dayjs.locale(locale);
document.documentElement.setAttribute("lang", locale);

const baseTheme: ThemeConfig = {
  token: {
    colorPrimary: "#ffcb05",
    fontFamily: "MTNBrighterSans",
    controlHeightSM: 28,
  },
  components: {
    DatePicker: {
      controlHeightSM: 28,
    },
    Button: {
      primaryColor: "black",
      fontWeight: 500,
      paddingInlineSM: 12,
    },
    Form: {
      itemMarginBottom: 12,
      verticalLabelPadding: "0 0 0px",
    },
    Cascader: {
      dropdownHeight: "fit-content",
    },
    Tabs: {
      itemSelectedColor: "#d0a000",
      inkBarColor: "#d0a000",
    },
  },
};

export const appColors = ["system", "light", "dark"] as const;
export type AppColor = (typeof appColors)[number];

export type AppTheme = {
  isDark: boolean;
  value: AppColor;
  setValue: (value: AppColor) => void;
};

const AppThemeContext = createContext<AppTheme>({
  setValue: () => {},
  value: "system",
  isDark: false,
});

const LS_KEY = "color-theme";

function getInitialValue(): AppColor {
  const ls = localStorage.getItem(LS_KEY) as AppColor | null;
  return ls && appColors.includes(ls) ? ls : "system";
}

function systemDarkQuery() {
  return window.matchMedia("(prefers-color-scheme: dark)");
}

export default function ThemeProvider(props: PropsWithChildren) {
  const [systemDark, setSystemDark] = useState(systemDarkQuery().matches);
  const [value, _setValue] = useState(getInitialValue);

  const setValue = (value: AppColor) => {
    _setValue(value);
    localStorage.setItem(LS_KEY, value);
  };

  useEffect(() => {
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    const query = systemDarkQuery();

    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }, []);

  const isDark = value === "dark" || (value === "system" && systemDark);
  const algorithm = isDark ? theme.darkAlgorithm : theme.defaultAlgorithm;

  useEffect(() => {
    if (isDark) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <AppThemeContext value={{ isDark, value, setValue }}>
      <ConfigProvider theme={{ ...baseTheme, algorithm }} locale={antLocale}>
        <App>{props.children}</App>
      </ConfigProvider>
    </AppThemeContext>
  );
}

export function useAppTheme() {
  return use(AppThemeContext);
}
