import { useMemo } from "react";
import { type FhpImageType, WorkDocType } from "schema/enums";
import { type Maybe, zArray } from "schema/utils";
import { workDocZ } from "schema/work";
import { useApiGet } from "#/api/helpers";

export function useFhsImageNames(surveyId: Maybe<string>) {
  const { data, error, isLoading } = useApiGet(
    ["work", surveyId ?? "", "docs"],
    zArray(workDocZ),
    undefined,
    { enabled: !!surveyId },
  );
  const names = useMemo(() => {
    const type = WorkDocType.PLAN_KMZ;
    const doc = data?.find((d) => d.type === type);
    const plan = doc?.upload?.parsed;
    if (plan?.type !== type) return null;

    const poles = [...plan.metalPoles, ...plan.concretePoles];
    const boxNames = plan.boxes.map((b) => b.name);
    const poleNames = poles.map((p) => p.name);
    const cableNames = plan.cables.map((c) => c.name);

    const names: Record<FhpImageType, string[]> = {
      BOXES: boxNames,
      POLES: poleNames,
      CABLES: cableNames,
      POWER_TEST: boxNames,
      MANHOLES: [],
      TRENCHING: [],
    };
    return names;
  }, [data]);
  return { data: names, error, isLoading };
}

export type FhsImageNames = ReturnType<typeof useFhsImageNames>;
