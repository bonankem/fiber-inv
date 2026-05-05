type Props = {
  title: string;
  caption?: string;
};

export default function WithCaption(props: Props) {
  return (
    <div>
      <div>{props.title}</div>
      {props.caption && (
        <div className="text-yellow-600 leading-tight">{props.caption}</div>
      )}
    </div>
  );
}
