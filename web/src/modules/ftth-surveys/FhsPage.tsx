import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { omit } from "remeda";
import { Subset, subsetCountsZ } from "schema/common";
import { fhsFilterZ, ftthSurveyZ } from "schema/fhs";
import { zArray } from "schema/utils";
import { getJson } from "#/api/helpers";
import DataPage from "#/components/data-page/DataPage";
import { subsetsDefault } from "#/components/data-page/utils";
import { useApiQuery } from "#/hooks/useApiQuery";
import FhsDetailsModal from "./FhsDetailsModal";
import { fhsActions } from "./fhs-actions";
import { fhsColumns } from "./fhs-columns";

export default function FhsPage() {
  const api = useApiQuery({
    url: "/fhs",
    input: fhsFilterZ,
    output: zArray(ftthSurveyZ),
    defaults: { subset: Subset.TOTAL },
  });

  const countDto = useMemo(
    () => omit(api.dto, ["page", "count", "subset"]),
    [api.dto],
  );
  const counts = useQuery({
    queryFn: () => getJson("/fhs/count", subsetCountsZ, countDto),
    queryKey: ["fhs", "count", countDto],
    staleTime: 1000 * 60,
  });

  return (
    <DataPage
      table={{
        data: api.query.data,
        columns: fhsColumns,
        actions: fhsActions,
        modal: FhsDetailsModal,
      }}
      subsets={subsetsDefault(
        api.dto.subset,
        api.setter("subset"),
        counts.data,
      )}
    />
  );
}
