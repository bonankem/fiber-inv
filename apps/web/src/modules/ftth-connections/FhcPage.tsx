import { useMemo } from "react";
import { omit } from "remeda";
import { Subset, subsetCountsZ } from "schema/common";
import { fhcFilterZ, ftthConnectionZ } from "schema/fhc";
import { zArray } from "schema/utils";
import { useApiGet } from "#/api/helpers";
import DataPage from "#/components/data-page/DataPage";
import { subsetsDefault } from "#/components/data-page/utils";
import { useApiQuery } from "#/hooks/useApiQuery";
import FhcDetailsModal from "./details/FhcDetailsModal";
import { fhcActions } from "./fhc-actions";
import { fhcColumns } from "./fhc-columns";

export default function FhcPage() {
  const api = useApiQuery({
    url: "/fhc",
    input: fhcFilterZ,
    output: zArray(ftthConnectionZ),
    defaults: { subset: Subset.TOTAL },
  });

  const countDto = useMemo(
    () => omit(api.dto, ["page", "count", "subset"]),
    [api.dto],
  );
  const counts = useApiGet("fhc/count", subsetCountsZ, countDto);
  return (
    <DataPage
      table={{
        data: api.query.data,
        columns: fhcColumns,
        actions: fhcActions,
        modal: FhcDetailsModal,
      }}
      subsets={subsetsDefault(
        api.dto.subset,
        api.setter("subset"),
        counts.data,
      )}
    />
  );
}
