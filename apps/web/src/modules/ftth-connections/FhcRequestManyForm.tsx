import { Button, message, Upload } from "antd";
import { m } from "i18n/messages";
import { useState } from "react";
import { idNameZ } from "schema/common";
import type { FhcRequestManyT, FhcRequestT } from "schema/fhc";
import { zArray } from "schema/utils";
import {
  apiCall,
  showAppError,
  useApiGet,
  useApiPost,
  useApiUpload,
} from "#/api/helpers";
import CoordsLink from "#/components/CoordsLink";
import DataTable from "#/components/data-page/DataTable";
import FormModal from "#/components/FormModal";
import VendorSelect from "#/components/inputs/VendorSelect";
import type { ModalStateProps } from "#/hooks/useModalViewer";

export default function FhcRequestManyForm(props: ModalStateProps) {
  const send = useApiPost<FhcRequestManyT>("/fhc/many");
  const load = useApiUpload<FhcRequestT[]>("/fhc/extract");
  const locs = useApiGet("/geo/localities", zArray(idNameZ));
  const [items, setItems] = useState<FhcRequestT[]>([]);

  const locNames = Object.fromEntries(
    locs.data?.map((l) => [l.id, l.name]) || [],
  );

  const onSubmit = apiCall(async () => {
    if (!items.length) {
      return showAppError("No data");
    }
    await send.mutateAsync({ items });
    message.success(m.toast_sent());
    props.state.close();
  });

  const onUpload = apiCall(async (file: File) => {
    const items = await load.mutateAsync(file);
    setItems(items);
    message.info(`${items.length} item(s)`);
    return false;
  });

  return (
    <FormModal
      title={m.fhc_form_request()}
      width="calc(min(1200px,90vw))"
      state={props.state}
      onSubmit={onSubmit}
      submitting={load.isPending || send.isPending}
      checkbox={!!items.length}
      hasOk={!!items.length}
    >
      {items.length ? (
        <DataTable
          inModal
          data={items}
          columns={[
            {
              key: "tn",
              title: "TN",
              render: (f) => f.tn,
              width: 120,
            },
            {
              key: "vendor",
              title: m.field_vendor(),
              render: (f) => (
                <VendorSelect
                  showSearch={false}
                  className="w-full pl-0! min-w-[8em]!"
                  variant="borderless"
                  value={f.vendorId}
                  onChange={(v) =>
                    setItems((items) =>
                      items.map((i) =>
                        i.tn === f.tn ? { ...i, vendorId: v } : i,
                      ),
                    )
                  }
                />
              ),
              width: 150,
            },
            {
              key: "name",
              title: m.name(),
              render: (f) => f.name,
              width: 300,
            },
            {
              key: "contact",
              title: m.client_contact(),
              render: (f) => f.phone,
              width: 150,
            },
            {
              key: "locality",
              title: m.locality(),
              render: (f) => locNames[f.localityId],
              width: 120,
            },
            {
              key: "ontSerial",
              title: "ONT SN",
              render: (f) => f.ontSerial,
              width: 150,
            },
            {
              key: "ontOem",
              title: "ONT OEM",
              render: (f) => f.ontOem?.toUpperCase(),
              width: 100,
            },
            {
              key: "coords",
              title: m.coords(),
              render: (f) => <CoordsLink coords={f.coords} />,
              width: 150,
            },
          ]}
        />
      ) : (
        <div className="w-full flex flex-col items-center gap-4 p-8">
          <p>Upload an Excel File</p>
          <Upload
            accept=".xlsx,.xls"
            fileList={[]}
            beforeUpload={onUpload}
            classNames={{ root: "block", trigger: "w-full relative" }}
          >
            <Button type="primary">Select File</Button>
          </Upload>
        </div>
      )}
    </FormModal>
  );
}
