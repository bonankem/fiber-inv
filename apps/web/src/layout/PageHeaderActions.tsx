import {
    createContext,
    type PropsWithChildren,
    type ReactNode,
    useContext,
    useState,
} from "react";

export type PageHeaderActions = {
  desktop: ReactNode;
  mobile: ReactNode;
};

type PageHeaderActionsContextValue = {
  actions: PageHeaderActions | null;
  setActions: (actions: PageHeaderActions | null) => void;
};

const PageHeaderActionsContext =
  createContext<PageHeaderActionsContextValue | null>(null);

export function PageHeaderActionsProvider(props: PropsWithChildren) {
  const [actions, setActions] = useState<PageHeaderActions | null>(null);
  return (
    <PageHeaderActionsContext.Provider value={{ actions, setActions }}>
      {props.children}
    </PageHeaderActionsContext.Provider>
  );
}

export function usePageHeaderActions() {
  const context = useContext(PageHeaderActionsContext);
  if (!context) {
    throw new Error("PageHeaderActionsProvider is missing");
  }
  return context;
}