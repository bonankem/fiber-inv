import { Outlet } from "@tanstack/react-router";
import { Card } from "antd";

export default function AuthLayout() {
  return (
    <div className="full-screen centered bg-gray-100">
      <div className="w-full max-w-sm m-auto">
        <Card>
          <Outlet />
        </Card>
      </div>
    </div>
  );
}
