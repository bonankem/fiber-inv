import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Form, Input, message, Select } from "antd";
import type { FhpRequestT, FtthProjectT } from "schema/fhp";
import { type Maybe, zArray } from "schema/utils";
import { workBriefZ } from "schema/work";
import { apiCall, getJson, postFn } from "#/api/helpers";
import FormModal from "#/components/FormModal";
import CoordsInput from "#/components/inputs/CoordsInput";
import LocalitySelect from "#/components/inputs/LocalitySelect";
import StaffSelect from "#/components/inputs/StaffSelect";
import type { ModalStateProps } from "#/hooks/useModalViewer";
import { req } from "#/utils/form";

export default function FhpRequestForm(props: ModalStateProps) {
  const [form] = Form.useForm<FhpRequestT>();

  const surveysQ = useQuery({
    queryFn: () => getJson("/fhs/for-project", zArray(workBriefZ)),
    queryKey: ["fhp", "for-project"],
  });

  const onSelectSurvey = (id: Maybe<string>) => {
    const s = id && surveysQ.data?.find((s) => s.id === id);
    if (!s) return;

    form.setFieldsValue({
      name: s.name,
      localityId: s.localityId || undefined,
      coords: s.coords || undefined,
    });
  };

  const qc = useQueryClient();
  const submitM = useMutation({
    mutationFn: postFn<FhpRequestT, FtthProjectT>("/fhp"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fhp"] }),
  });

  const onSubmit = apiCall(async (data: FhpRequestT) => {
    const result = await submitM.mutateAsync(data);
    message.success(`${result.work.sid} requested`);
    props.state.close();
  });

  return (
    <FormModal
      form={form}
      title="Demande de projet FTTH"
      state={props.state}
      onSubmit={onSubmit}
      submitting={submitM.isPending}
    >
      <Form.Item name="surveyId" label="Etude" {...req}>
        <Select
          loading={surveysQ.isLoading}
          options={surveysQ.data?.map((s) => ({ value: s.id, label: s.name }))}
          showSearch={{ optionFilterProp: "label" }}
          onSelect={onSelectSurvey}
        />
      </Form.Item>

      <Form.Item name="coords" label="Coordonnées" {...req}>
        <CoordsInput />
      </Form.Item>

      <Form.Item name="localityId" label="Localité" {...req}>
        <LocalitySelect />
      </Form.Item>

      <Form.Item name="name" label="Nom" required>
        <Input required id="fhs-name" />
      </Form.Item>

      <Form.Item name="contact" label="Contact local" required>
        <Input required id="fhs-contact" />
      </Form.Item>

      <Form.Item name="managerId" label="Envoyer à responsable" {...req}>
        <StaffSelect filter="PROJECT_MANAGER" />
      </Form.Item>

      <Form.Item name="comment" label="Commentaire">
        <Input.TextArea rows={3} className="resize-none!" />
      </Form.Item>
    </FormModal>
  );
}
