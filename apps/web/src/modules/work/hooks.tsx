import { workDocZ } from "schema/work";
import { useApiGet } from "#/api/helpers";

export function useWorkDocs(id: string) {
  return useApiGet(["work", id, "docs"], workDocZ.array());
}
