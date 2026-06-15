"use client";

import { useEffect, useMemo, useState } from "react";
import type { OutpatientProductionRow } from "@/shared/types/production";
import {
  CURRENT_OUTPATIENT_PRODUCTION_PLAN_ID,
  filterCurrentOutpatientProductionRows,
  readCurrentOutpatientProductionRowIds,
} from "@/features/outpatient-production/utils/current-outpatient-production-session";
import type {
  DimensioningResultFilters,
  SavedMeDimensioningRow,
  SavedOoDimensioningResultRow,
} from "../types/outpatient-dimensioning-results.types";
import {
  buildDimensioningResultOptions,
  calculateDimensioningResultSummary,
  calculateOutpatientDimensioningResults,
  filterDimensioningResultRows,
  groupByPeriod,
  initialResultFilters,
} from "../utils/outpatient-dimensioning-results-calculations";

export function useOutpatientDimensioningResults() {
  const [productionRows, setProductionRows] = useState<OutpatientProductionRow[]>(
    []
  );
  const [dimensioningRows, setDimensioningRows] = useState<
    SavedMeDimensioningRow[]
  >([]);
  const [ooResultRows, setOoResultRows] = useState<
    SavedOoDimensioningResultRow[]
  >([]);
  const [filters, setFilters] =
    useState<DimensioningResultFilters>(initialResultFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchResultBasis() {
      try {
        const currentRowIds = readCurrentOutpatientProductionRowIds();

        if (currentRowIds.length === 0) {
          setProductionRows([]);
          setDimensioningRows([]);
          setOoResultRows([]);
          return;
        }

        const [
          productionResponse,
          dimensioningResponse,
          ooResultsResponse,
        ] = await Promise.all([
          fetch(
            `/api/outpatient-production-rows?productionPlanId=${CURRENT_OUTPATIENT_PRODUCTION_PLAN_ID}`,
            {
              signal: controller.signal,
            }
          ),
          fetch(
            `/api/outpatient-dimensioning-me-rows?productionPlanId=${CURRENT_OUTPATIENT_PRODUCTION_PLAN_ID}`,
            {
              signal: controller.signal,
            }
          ),
          fetch(
            `/api/outpatient-dimensioning-oo-results?productionPlanId=${CURRENT_OUTPATIENT_PRODUCTION_PLAN_ID}`,
            {
              signal: controller.signal,
            }
          ),
        ]);

        if (
          !productionResponse.ok ||
          !dimensioningResponse.ok ||
          !ooResultsResponse.ok
        ) {
          throw new Error("Could not fetch outpatient dimensioning results.");
        }

        const [productionData, dimensioningData, ooResultsData] =
          await Promise.all([
            productionResponse.json() as Promise<OutpatientProductionRow[]>,
            dimensioningResponse.json() as Promise<SavedMeDimensioningRow[]>,
            ooResultsResponse.json() as Promise<
              SavedOoDimensioningResultRow[]
            >,
          ]);

        const currentProductionRows = filterCurrentOutpatientProductionRows(
          productionData,
          currentRowIds
        );
        const currentRowIdSet = new Set(currentRowIds);
        const currentDimensioningRows = dimensioningData.filter(
          (row) =>
            row.production_row_id === null ||
            currentRowIdSet.has(row.production_row_id)
        );
        const currentOoResultRows = ooResultsData.filter(
          (row) =>
            row.production_row_id === null ||
            currentRowIdSet.has(row.production_row_id)
        );

        setProductionRows(currentProductionRows);
        setDimensioningRows(currentDimensioningRows);
        setOoResultRows(currentOoResultRows);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error(error);
          setErrorMessage("Något gick fel vid hämtning av resultatdata.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    fetchResultBasis();

    return () => controller.abort();
  }, []);

  const resultRows = useMemo(
    () =>
      calculateOutpatientDimensioningResults(
        productionRows,
        dimensioningRows,
        ooResultRows
      ),
    [dimensioningRows, ooResultRows, productionRows]
  );

  const filteredRows = useMemo(
    () => filterDimensioningResultRows(resultRows, filters),
    [filters, resultRows]
  );

  const groupedRows = useMemo(
    () => groupByPeriod(filteredRows, filters.periodization),
    [filteredRows, filters.periodization]
  );

  const options = useMemo(
    () => buildDimensioningResultOptions(resultRows),
    [resultRows]
  );

  const summary = useMemo(
    () => calculateDimensioningResultSummary(groupedRows),
    [groupedRows]
  );

  function handleFilterChange(
    field: keyof DimensioningResultFilters,
    value: string
  ) {
    setFilters((current) => ({ ...current, [field]: value }));
  }

  function clearFilters() {
    setFilters(initialResultFilters);
  }

  return {
    clearFilters,
    errorMessage,
    filteredRows,
    filters,
    groupedRows,
    handleFilterChange,
    isLoading,
    options,
    resultRows,
    summary,
  };
}
