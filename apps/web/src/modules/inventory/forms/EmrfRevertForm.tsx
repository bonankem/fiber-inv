import { CloseCircleOutlined, PaperClipOutlined } from "@ant-design/icons";
import { Button, Form, Input, message, Upload } from "antd";
import { useState } from "react";
import { apiCall } from "#/api/helpers";
import FormModal from "#/components/FormModal";
import type { ModalItemProps } from "#/hooks/useModalViewer";
import { useUploader } from "#/hooks/useUploader";
import { useCancelEmrf } from "#/modules/hooks/inventory";
import { type EmrfRow, emrfJobName } from "../emrf-utils";
import EmrfSummary from "./EmrfSummary";

type RevertFormT = {
  comment: string;
};

type PendingFile = {
  id: string;
  name: string;
};

/** Requested EMRFs can be reverted; capture the reason and supporting evidence. */
export default function EmrfRevertForm(props: ModalItemProps<EmrfRow>) {
  const revert = useCancelEmrf();
  const uploader = useUploader();
  const [files, setFiles] = useState<PendingFile[]>([]);

  const onSubmit = apiCall(async ({ comment }: RevertFormT) => {
    const unfinished = files.some(
      (file) => !uploader.find(file.id)?.done,
    );

    if (unfinished) {
      message.error("Wait for uploads to finish or remove any failed files.");
      return;
    }

    await revert.mutateAsync({
      id: props.item.id,
      comment,
      uploads: files.map((file) => file.id),
    });

    message.success("EMRF reverted");
    props.state.close();
  });

  const addFile = (file: File) => {
    const record = uploader.send(file);

    setFiles((current) => [
      ...current,
      { id: record.id, name: record.name },
    ]);

    return false;
  };

  const removeFile = (id: string) => {
    uploader.cancel(id);
    setFiles((current) => current.filter((file) => file.id !== id));
  };

  return (
    <FormModal<RevertFormT>
      title="Revert EMRF"
      subtitle={emrfJobName(props.item)}
      state={props.state}
      width={480}
      okText="Revert EMRF"
      danger
      checkbox="I understand this cancels the EMRF"
      submitting={revert.isPending}
      onSubmit={onSubmit}
    >
      <EmrfSummary emrf={props.item} />

      <Form.Item
        label="Reason for revert"
        name="comment"
        rules={[
          { required: true, whitespace: true, message: "Enter a reason" },
          { max: 2000, message: "Use 2,000 characters or fewer" },
        ]}
      >
        <Input.TextArea maxLength={2000} rows={4} showCount />
      </Form.Item>

      <div className="flex flex-col gap-2">
        <Upload
          multiple
          fileList={[]}
          showUploadList={false}
          beforeUpload={addFile}
        >
          <Button icon={<PaperClipOutlined />}>
            Attach supporting files
          </Button>
        </Upload>

        {files.map((file) => {
          const record = uploader.find(file.id);

          return (
            <div
              key={file.id}
              className="flex items-center justify-between gap-2 text-xs"
            >
              <span className="truncate">
                {file.name}
                {record?.done === false && " · uploading"}
                {!record && " · upload failed"}
              </span>

              <Button
                aria-label={`Remove ${file.name}`}
                icon={<CloseCircleOutlined />}
                onClick={() => removeFile(file.id)}
                size="small"
                type="text"
              />
            </div>
          );
        })}
      </div>
    </FormModal>
  );
}