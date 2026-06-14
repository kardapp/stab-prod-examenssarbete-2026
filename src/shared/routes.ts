export const appRoutes = {
  firstPage: "/",
  outpatientProductionPlanning: "/outpatient/production-planning",
  outpatientOoDistribution: "/outpatient/production-planning/oo-distribution",
  outpatientProductionPlanningResults: "/outpatient/production-planning/results",
  outpatientDimensioning: "/outpatient/dimensioning",
  outpatientOoDimensioning: "/outpatient/dimensioning/oo",
  outpatientDimensioningResults: "/outpatient/dimensioning/results",
  inpatientProductionPlanning: "/inpatient/production-planning",
  inpatientOoDistribution: "/inpatient/production-planning/oo-distribution",
  inpatientProductionPlanningResults: "/inpatient/production-planning/results",
  inpatientDimensioning: "/inpatient/dimensioning",
  inpatientOoDimensioning: "/inpatient/dimensioning/oo",
  inpatientDimensioningResults: "/inpatient/dimensioning/results",
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
