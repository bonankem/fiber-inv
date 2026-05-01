import { ConfigProvider, type ThemeConfig, theme } from "antd";
import {
  createContext,
  type PropsWithChildren,
  use,
  useEffect,
  useState,
} from "react";

const baseTheme: ThemeConfig = {
  token: {
    colorPrimary: "#ffcb05",
    fontFamily: "inherit",
    controlHeightSM: 28,
  },
  components: {
    DatePicker: {
      controlHeightSM: 25,
    },
    Button: {
      primaryColor: "black",
      fontWeight: 500,
      paddingInlineSM: 12,
    },
    Form: {
      itemMarginBottom: 16,
      verticalLabelPadding: "0 0 4px",
    },
    Cascader: {
      dropdownHeight: "fit-content",
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

  return (
    <AppThemeContext value={{ isDark, value, setValue }}>
      <ConfigProvider theme={{ ...baseTheme, algorithm }}>
        {props.children}
      </ConfigProvider>
    </AppThemeContext>
  );
}

export function useAppTheme() {
  return use(AppThemeContext);
}
