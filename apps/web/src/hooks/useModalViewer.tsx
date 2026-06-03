import { createContext, type FC, use } from "react";

export type ModalState = {
  isOpen: boolean;
  close: () => void;
};

export type ModalStateProps = {
  state: ModalState;
};

export type ModalItemProps<T> = {
  state: ModalState;
  item: T;
};

export type ModalFC = FC<ModalStateProps>;

export type ModalItemFC<T> = FC<ModalItemProps<T>>;

export type ModalViewer = {
  isOpen: boolean;
  open(m: ModalFC): void;
  openWith<T>(m: ModalItemFC<T>, item: T): void;
  close(): void;
};

export const ModalContext = createContext<ModalViewer>({
  isOpen: false,
  open: () => console.error("No ModalContext"),
  openWith: () => console.error("No ModalContext"),
  close: () => console.error("No ModalContext"),
});

export function useModalViewer() {
  return use(ModalContext);
}
