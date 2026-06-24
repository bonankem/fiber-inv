import { Form, Input, message, Select } from "antd";
import { m } from "i18n/messages";
import { useEffect, useState } from "react";
import { type SyslogT, syslogZ } from "schema/admin";
import { apiCall, useApiGet, useApiPost } from "#/api/helpers";
import FormModal from "#/components/FormModal";
import IntInput from "#/components/inputs/IntInput";
import type { ModalStateProps } from "#/hooks/useModalViewer";

export default function SyslogForm(props: ModalStateProps) {
  const [form] = Form.useForm<SyslogT>();
  const query = useApiGet<SyslogT>("/admin/syslog", syslogZ);
  const send = useApiPost<SyslogT>("/admin/syslog", ["admin"]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (query.data && !ready) {
      form.setFieldsValue(query.data);
      setReady(true);
    }
  }, [ready, query.data, form]);

  const onSubmit = apiCall(async (data: SyslogT) => {
    await send.mutateAsync(data);
    message.success(m.saved());
    props.state.close();
  });

  return (
    <FormModal
      form={form}
      width={320}
      state={props.state}
      title={m.syslog_server()}
      onSubmit={onSubmit}
      okText={m.save()}
      checkbox={false}
      className="grid grid-cols-2 gap-2"
    >
      <Form.Item name="host" label={m.host()} className="col-span-full">
        <Input placeholder={m.host_hint()} />
      </Form.Item>

      <Form.Item name="port" label={m.port_udp()}>
        <IntInput />
      </Form.Item>

      <Form.Item name="enabled" label={m.state()}>
        <Select
          options={[
            { value: true, label: m.enabled() },
            { value: false, label: m.disabled() },
          ]}
        />
      </Form.Item>
    </FormModal>
  );
}
