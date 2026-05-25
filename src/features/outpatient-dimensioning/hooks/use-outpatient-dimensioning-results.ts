"use client";

import { useEffect, useMemo, useState } from "react";
import type { OutpatientProductionRow } from "@/types/production";
import type {
  DimensioningResultFilters,
  SavedMeDimensioningRow,
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
  const [filters, setFilters] =
    useState<DimensioningResultFilters>(initialResultFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchResultBasis() {
      try {
        const [productionResponse, dimensioningResponse] = await Promise.all([
          fetch("/api/outpatient-production-rows", {
            signal: controller.signal,
          }),
          fetch("/api/outpatient-dimensioning-me-rows", {
            signal: controller.signal,
          }),
        ]);

        if (!productionResponse.ok || !dimensioningResponse.ok) {
          throw new Error("Could not fetch outpatient dimensioning results.");
        }

        const [productionData, dimensioningData] = await Promise.all([
          productionResponse.json() as Promise<OutpatientProductionRow[]>,
          dimensioningResponse.json() as Promise<SavedMeDimensioningRow[]>,
        ]);

        setProductionRows(productionData);
        setDimensioningRows(dimensioningData);
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
      calculateOutpatientDimensioningResults(productionRows, dimensioningRows),
    [dimensioningRows, productionRows]
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
