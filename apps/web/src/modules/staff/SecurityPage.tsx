import { Button, Card, Descriptions } from "antd";
import { m } from "i18n/messages";
import { securityZ } from "schema/admin";
import { useApiGet } from "#/api/helpers";
import { useModalViewer } from "#/hooks/useModalViewer";
import SecurityForm from "./SecurityForm";

export default function SecurityPage() {
  const query = useApiGet("/admin/security", securityZ);
  const data = query.data;
  const modal = useModalViewer();

  return (
    <div className="w-full h-full flex items-center justify-center">
      <Card className="max-w-xs">
        <div className="mb-2">{m.sec_inactivity()}</div>
        <Descriptions
          layout="horizontal"
          size="small"
          column={1}
          items={[
            {
              key: "1",
              label: m.sec_users(),
              children: data?.userInactiveDays,
            },
            {
              key: "2",
              label: m.sec_admins(),
              children: data?.adminInactiveDays,
            },
            {
              key: "3",
              label: m.sec_new_accts(),
              children: data?.newInactiveDays,
            },
          ]}
        />

        <div className="mb-2 mt-4">{m.sec_lockout()}</div>
        <Descriptions
          layout="horizontal"
          size="small"
          column={1}
          items={[
            {
              key: "1",
              label: m.sec_failed_attempts(),
              children: data?.lockoutAttempts,
            },
            {
              key: "2",
              label: m.sec_lockout_minutes(),
              children: data?.lockoutMinutes,
            },
          ]}
        />
        {data && (
          <Button
            size="small"
            type="primary"
            className="mt-4"
            onClick={() => modal.openWith(SecurityForm, data)}
          >
            Change
          </Button>
        )}
      </Card>
    </div>
  );
}
