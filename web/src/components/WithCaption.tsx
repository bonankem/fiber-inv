import { twJoin } from "tailwind-merge";

type Props = {
  title: string;
  caption?: string;
  smallCaption?: boolean;
};

export default function WithCaption(props: Props) {
  return (
    <div>
      <div>{props.title}</div>
      {props.caption && (
        <div
          className={twJoin(
            "text-yellow-600 leading-tight",
            props.smallCaption && "text-sm",
          )}
        >
          {props.caption}
        </div>
      )}
    </div>
  );
}
