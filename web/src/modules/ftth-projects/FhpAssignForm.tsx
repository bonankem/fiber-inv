import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Form, message } from "antd";
import type { FhpAssignT, FtthProjectT } from "schema/fhp";
import { apiCall, postFn } from "#/api/helpers";
import FormModal from "#/components/FormModal";
import StaffSelect from "#/components/inputs/StaffSelect";
import VendorSelect from "#/components/inputs/VendorSelect";
import { req } from "#/utils/form";
import type { FhpFormProps } from "./fhp-types";

export default function FhpAssignForm(props: FhpFormProps) {
  const qc = useQueryClient();
  const submitM = useMutation({
    mutationFn: postFn<FhpAssignT, FtthProjectT>("/fhp/assign"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fhp"] }),
  });

  const onSubmit = apiCall(async (data: FhpAssignT) => {
    data.id = props.item.id;
    const result = await submitM.mutateAsync(data);
    message.success(`Assigned ${result.work.sid}`);
    props.state.close();
  });

  return (
    <FormModal
      title="Assign FTTH Project"
      subtitle={props.item.work.name}
      state={props.state}
      onSubmit={onSubmit}
    >
      <Form.Item name="userId" label="Engineer" {...req}>
        <StaffSelect filter="PROJECT_ENGINEER" />
      </Form.Item>

      <Form.Item name="vendorId" label="Vendor">
        <VendorSelect placeholder="Facultatif" allowClear />
      </Form.Item>
    </FormModal>
  );
}
