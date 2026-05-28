type Props = {
  text: string;
  longTail?: boolean;
};

/** Split the text into two parts so an ellipsis can be placed in-between. */
function splitText(props: Props): [string, string] {
  const s = props.text;
  if (!s || s.length < 10) return [s, ""];

  const match =
    (props.longTail && /^(.{5}.*?\S)\b(\w{10,20})$/.exec(s)) ||
    (props.longTail && /^(.{5}.*?\S)(\S.{10,20})$/.exec(s)) ||
    /^(.{5}.*?\S)\b(\w{3,10})$/.exec(s) ||
    /^(.{5}.*?\S)(\S.{3,20})$/.exec(s);
  return match ? [match[1], match[2]] : [s, ""];
}

export default function FittedText(props: Props) {
  const [head, tail] = splitText(props);
  return (
    <div className="whitespace-nowrap overflow-hidden inline-flex">
      <span className="text-ellipsis min-w-0 shrink whitespace-pre">
        {head}
      </span>
      {tail && <span className="shrink-0">{tail}</span>}
    </div>
  );
}
