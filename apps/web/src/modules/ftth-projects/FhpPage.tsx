import { useMemo } from "react";
import { omit } from "remeda";
import { Subset, subsetCountsZ } from "schema/common";
import { fhpFilterZ, ftthProjectZ } from "schema/fhp";
import { zArray } from "schema/utils";
import { useApiGet } from "#/api/helpers";
import DataPage from "#/components/data-page/DataPage";
import { subsetsDefault } from "#/components/data-page/utils";
import { useApiQuery } from "#/hooks/useApiQuery";
import FhpDetailsModal from "./details/FhpDetailsModal";
import { fhpActions } from "./fhp-actions";
import { fhpColumns } from "./fhp-columns";

export default function FhpPage() {
  const api = useApiQuery({
    url: "/fhp",
    input: fhpFilterZ,
    output: zArray(ftthProjectZ),
    defaults: { subset: Subset.TOTAL },
  });

  const countDto = useMemo(
    () => omit(api.dto, ["page", "count", "subset"]),
    [api.dto],
  );
  const counts = useApiGet("fhp/count", subsetCountsZ, countDto);

  return (
    <DataPage
      table={{
        data: api.query.data,
        columns: fhpColumns,
        actions: fhpActions,
        modal: FhpDetailsModal,
      }}
      subsets={subsetsDefault(
        api.dto.subset,
        api.setter("subset"),
        counts.data,
      )}
    />
  );
}
