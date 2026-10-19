import { Form } from "antd";
import type { WorkDocType } from "schema/enums";
import type { UploadFullT } from "schema/uploads";
import type { WorkDocT, WorkFullT } from "schema/work";
import { req } from "#/utils/form";
import FileUpload, { type Parsed } from "./FileUpload";

type Props<T> = {
  type: T;
  label: string;
  old?: WorkDocT[] | WorkFullT | { data?: { work: WorkFullT } };
  onParsed?: (p: Parsed<T>) => void;
};

function getDocs(old: Props<unknown>["old"]) {
  if (!old) return undefined;
  if (Array.isArray(old)) return old;
  if ("docs" in old) return old.docs;
  if ("data" in old) return old.data?.work?.docs;
  return undefined;
}

function getDoc<T extends WorkDocType>(props: Props<T>) {
  const docs = getDocs(props.old);
  const found = docs?.find((d) => d.type === props.type);
  if (!found) return undefined;
  return found.upload as UploadFullT & { parsed: { type: T } };
}

export default function WorkDocInput<T extends WorkDocType>(props: Props<T>) {
  return (
    <Form.Item label={props.label} name={props.type as string} {...req}>
      <FileUpload
        required
        type={props.type}
        previous={getDoc(props)}
        onParsed={props.onParsed}
        inputClassName="placeholder:text-gray-400!"
      />
    </Form.Item>
  );
}
