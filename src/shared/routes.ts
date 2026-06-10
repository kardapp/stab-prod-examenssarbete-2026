export const appRoutes = {
  firstPage: "/firstpage",
  outpatientProductionPlanning: "/outpatient/productionplanning",
  outpatientOoDistribution: "/outpatient/productionplanning/oodistribution",
  outpatientProductionPlanningResults: "/outpatient/productionplanning/results",
  outpatientDimensioning: "/outpatient/dimensioning",
  outpatientOoDimensioning: "/outpatient/dimensioning/oo",
  outpatientDimensioningResults: "/outpatient/dimensioning/results",
} as const;

type SearchParamValue =
  | string
  | number
  | boolean
  | readonly string[]
  | null
  | undefined;

export function withSearchParams(
  path: string,
  searchParams: Record<string, SearchParamValue>
): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (value === null || value === undefined) {
      continue;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item));
      continue;
    }

    params.set(key, String(value));
  }

  const queryString = params.toString();

  return queryString ? `${path}?${queryString}` : path;
}
