import { m } from "i18n/messages";
import { userFullZ } from "schema/people";
import { zArray } from "schema/utils";
import { useApiGet } from "#/api/helpers";
import DataPage from "#/components/data-page/DataPage";
import { roleName } from "./utils";

export default function StaffPage() {
  const query = useApiGet("/users", zArray(userFullZ));

  return (
    <DataPage
      table={{
        data: query.data,
        columns: [
          { key: "name", title: m.name(), render: (u) => u.name },
          { key: "email", title: m.email(), render: (u) => u.email },
          { key: "role", title: m.role(), render: (u) => roleName(u) },
          {
            key: "status",
            title: m.status(),
            render: (u) => (u.expiredAt ? "Expired" : "Active"),
          },
        ],
      }}
    />
  );
}
