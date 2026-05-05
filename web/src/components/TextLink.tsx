import { Link, type LinkProps } from "@tanstack/react-router";
import type { ReactNode } from "react";

type Props = LinkProps & {
  children: ReactNode;
};

export default function TextLink({ children, ...props }: Props) {
  return (
    <Link {...props}>
      <span className="text-yellow-600">{children}</span>
    </Link>
  );
}
