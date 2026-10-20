import { Form, Input } from "antd";
import { m } from "i18n/messages";

type CommentProps = {
  required?: boolean;
  label?: string;
  rows?: number;
};

type Props = {
  comment?: CommentProps | false;
};

export default function FormFooter(props: Props) {
  const com = props.comment;
  return (
    <>
      {com !== false && (
        <Form.Item
          name="comment"
          label={com?.label ?? "Comment"}
          required={com?.required ?? false}
          className="col-span-full"
        >
          {com?.rows === 1 ? (
            <Input
              required={com?.required ?? false}
              placeholder={com?.required ? undefined : m.optional()}
            />
          ) : (
            <Input.TextArea
              rows={com?.rows ?? 3}
              required={com?.required ?? false}
              placeholder={com?.required ? undefined : m.optional()}
              className="resize-none!"
            />
          )}
        </Form.Item>
      )}
    </>
  );
}
