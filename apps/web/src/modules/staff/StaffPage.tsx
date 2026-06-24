import dayjs from "dayjs";
import { m } from "i18n/messages";
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
  return m.active();
}

const actions = buildActions<UserFullT, unknown, unknown>(
  () => true,
  () => true,
  [{ name: "Unlock", form: UnlockForm, onlyIf: (u) => !!u.expiredAt }],
);

export default function StaffPage() {
  const query = useApiGet("/users", zArray(userFullZ));

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
