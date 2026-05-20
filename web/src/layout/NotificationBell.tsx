import { BellOutlined } from "@ant-design/icons";
import { Badge, Dropdown } from "antd";
import { twMerge } from "tailwind-merge";

type Props = {
  className?: string;
};

export default function NotificationBell(props: Props) {
  return (
    <Dropdown menu={{ items: [] }}>
      <Badge
        count={0}
        size="small"
        className={twMerge("text-xs!", props.className)}
        offset={[0, 0]}
      >
        <BellOutlined role="button" className="text-xl!" />
      </Badge>
    </Dropdown>
  );
}
