import { useLocation, useNavigate, useRouter } from "@tanstack/react-router";
import {
  type PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ModalContext,
  type ModalFC,
  type ModalItemFC,
} from "#/hooks/useModalViewer";

// biome-ignore lint/suspicious/noExplicitAny: allow any here
type AnyModal = ModalFC | ModalItemFC<any>;
const nothing = () => setTimeout(() => {}, 0);

export function ModalProvider(props: PropsWithChildren) {
  const [closing, setClosing] = useState(nothing);
  const [ModalFC, setModalFC] = useState<AnyModal>();
  const [isOpen, setIsOpen] = useState(false);
  const [item, setItem] = useState<unknown>();

  const { pathname, hash } = useLocation();
  const [oldPath, setOldPath] = useState(pathname);
  const navigate = useNavigate();
  const router = useRouter();

  const doClose = useCallback(() => {
    setIsOpen(false);
    setClosing((c) => {
      clearTimeout(c);
      // delay removing the modal component,
      // so that the closing animation plays out
      return setTimeout(() => {
        setModalFC(undefined);
        setItem(undefined);
      }, 500);
    });
  }, []);

  useEffect(() => {
    const back = () => {
      if (!isOpen) return;
      navigate({ hash: "" });
      doClose();
    };
    window.addEventListener("popstate", back);
    return () => window.removeEventListener("popstate", back);
  }, [doClose, isOpen, navigate]);

  useEffect(() => {
    // close modal when path changes
    if (oldPath !== pathname) {
      setOldPath(pathname);
      if (isOpen) doClose();
    }
    // remove #modal if modal is not open
    if (!isOpen && hash === "modal") {
      navigate({ hash: "", replace: true });
    }
  }, [oldPath, pathname, hash, isOpen, doClose, navigate]);

  const { open, openWith } = useMemo(() => {
    function addHash() {
      navigate({ hash: "modal" });
    }

    function open(m: ModalFC) {
      console.log("Opening", m.name);
      clearTimeout(closing);
      setModalFC(() => m);
      setItem(undefined);
      setIsOpen(true);
      addHash();
    }

    function openWith<T>(m: ModalItemFC<T>, i: T) {
      clearTimeout(closing);
      setModalFC(() => m);
      setItem(i);
      setIsOpen(true);
      addHash();
    }

    return { open, openWith };
  }, [navigate, closing]);

  const close = () => {
    router.history.back();
    doClose();
  };

  return (
    <ModalContext value={{ isOpen, open, openWith, close }}>
      {props.children}
      {ModalFC && <ModalFC item={item} state={{ isOpen, close }} />}
    </ModalContext>
  );
}
