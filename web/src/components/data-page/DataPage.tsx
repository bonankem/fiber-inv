import DataTable from "./DataTable";
import SubsetCards from "./SubsetCards";
import type { DataTableProps, SubsetCardsProps } from "./types";

type Props<T, S> = {
  subsets?: SubsetCardsProps<S> | false;
  table: DataTableProps<T>;
};

export default function DataPage<
  DataType extends { id: string },
  SubsType extends string,
>(props: Props<DataType, SubsType>) {
  return (
    <div className="py-4 px-4 md:px-8 flex flex-col items-stretch gap-3">
      {props.subsets && <SubsetCards {...props.subsets} />}
      <DataTable {...props.table} />
    </div>
  );
}
