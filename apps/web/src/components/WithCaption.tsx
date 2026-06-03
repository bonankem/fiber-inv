import type { ReactNode } from "react";
import { Fragment } from "react/jsx-runtime";
import type { Maybe } from "schema/utils";
import { twJoin } from "tailwind-merge";

type Props = {
  title: ReactNode;
  caption?: ReactNode | Maybe<string>[];
  smallCaption?: boolean;
  titleClass?: string;
};

function captionNode(props: Props) {
  if (!Array.isArray(props.caption)) {
    return props.caption;
  }
  const slash = (i: number) => (
    <span key={i} className="text-gray-400">
      {" / "}
    </span>
  );
  const nodes = props.caption
    .filter(Boolean)
    .flatMap((s, i) => (i === 0 ? [s] : [slash(i), s]));

  if (!nodes.length) return undefined;
  return <Fragment>{nodes}</Fragment>;
}

export default function WithCaption(props: Props) {
  return (
    <div>
      <div className={props.titleClass}>{props.title}</div>
      {props.caption && (
        <div
          className={twJoin(
            "text-yellow-600 leading-tight",
            props.smallCaption && "text-sm",
          )}
        >
          {captionNode(props)}
        </div>
      )}
    </div>
  );
}
