import { useNavigate } from "@tanstack/react-router";
import { Spin } from "antd";
import dayjs from "dayjs";
import { m } from "i18n/messages";
import { useEffect } from "react";
import { type UserFullT, userFullZ } from "schema/people";
import { zArray } from "schema/utils";
import { useApiGet } from "#/api/helpers";
import { buildActions } from "#/components/actions/types";
import DataPage from "#/components/data-page/DataPage";
import UnlockForm from "./UnlockForm";
import { roleName } from "./utils";

function statusOf(user: UserFullT) {
  if (user.expiredAt) {
    const date = dayjs(user.expiredAt).format("DD MMM");
    return <span className="text-red-700">{m.expired_on({ date })}</span>;
  }
  if (user.lockUntil) {
    const date = dayjs(user.lockUntil).format("DD MMM");
    return <span className="text-red-700">{m.locked_until({ date })}</span>;
  }
  return m.active();
}

const actions = buildActions<UserFullT, unknown, unknown>(
  () => true,
  () => true,
  [
    {
      name: "Unlock",
      form: UnlockForm,
      onlyIf: (u) => !!(u.expiredAt || u.lockUntil),
    },
  ],
);

export default function StaffPage() {
  const query = useApiGet("/users", zArray(userFullZ));
  const me = useApiGet("/session/user", userFullZ);
  const nav = useNavigate();

  useEffect(() => {
    if (!me.data?.isAdmin) {
      nav({ to: "/", replace: true });
    }
  }, [me.data?.isAdmin, nav]);

  if (me.isLoading) {
    return <Spin />;
  }

  return (
    <DataPage
      table={{
        data: query.data,
        actions,
        columns: [
          { key: "name", title: m.name(), render: (u) => u.name },
          { key: "email", title: m.email(), render: (u) => u.email },
          { key: "role", title: m.role(), render: (u) => roleName(u) },
          { key: "status", title: m.status(), render: (u) => statusOf(u) },
        ],
      }}
    />
  );
}
