type Props = {
  title: string;
  subtitle?: string;
};

export default function AuthHeader(props: Props) {
  return (
    <header className="text-center mb-6">
      <h1 className="text-lg font-medium">{props.title}</h1>
      {props.subtitle && <p className="text-sm ">{props.subtitle}</p>}
    </header>
  );
}
