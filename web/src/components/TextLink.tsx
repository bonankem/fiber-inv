import { Link, type LinkProps } from "@tanstack/react-router";
import type { PropsWithChildren } from "react";

type Props = PropsWithChildren<LinkProps | { onClick: () => void }>;

export default function TextLink({ children, ...props }: Props) {
  const link = <span className="text-yellow-600">{children}</span>;
  return "onClick" in props ? (
    <button type="button" onClick={props.onClick}>
      {link}
    </button>
  ) : (
    <Link {...props}>{link}</Link>
  );
}
