"use client";

import { useEffect, useMemo, useState } from "react";
import type { OutpatientProductionRow } from "@/types/production";
import type { SavedOoDistributionRow } from "../types/outpatient-oo-distribution.types";
import type { ProductionPlanningResultFilters } from "../types/outpatient-production-results.types";
import {
  buildProductionPlanningResultOptions,
  calculateDrgRows,
  calculateProductionPlanningResultRows,
  calculateProductionPlanningResultSummary,
  filterProductionPlanningResultRows,
  groupVisitsAndVisitTimeRows,
  initialProductionResultFilters,
  periodizeProductionPlanningResultRows,
} from "../utils/outpatient-production-results-calculations";

export function useOutpatientProductionResults() {
  const [productionRows, setProductionRows] = useState<OutpatientProductionRow[]>(
    []
  );
  const [ooDistributions, setOoDistributions] = useState<
    SavedOoDistributionRow[]
  >([]);
  const [filters, setFilters] = useState<ProductionPlanningResultFilters>(
    initialProductionResultFilters
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchResultBasis() {
      try {
        const [productionResponse, ooDistributionResponse] = await Promise.all([
          fetch("/api/outpatient-production-rows", {
            signal: controller.signal,
          }),
          fetch("/api/outpatient-oo-distributions", {
            signal: controller.signal,
          }),
        ]);

        if (!productionResponse.ok || !ooDistributionResponse.ok) {
          throw new Error("Could not fetch outpatient production results.");
        }

        const [productionData, ooDistributionData] = await Promise.all([
          productionResponse.json() as Promise<OutpatientProductionRow[]>,
          ooDistributionResponse.json() as Promise<SavedOoDistributionRow[]>,
        ]);

        setErrorMessage("");
        setProductionRows(productionData);
        setOoDistributions(ooDistributionData);
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
    () => calculateProductionPlanningResultRows(productionRows, ooDistributions),
    [ooDistributions, productionRows]
  );

  const filteredRows = useMemo(
    () => filterProductionPlanningResultRows(resultRows, filters),
    [filters, resultRows]
  );

  const periodizedRows = useMemo(
    () =>
      periodizeProductionPlanningResultRows(
        filteredRows,
        filters.periodization
      ),
    [filteredRows, filters.periodization]
  );

  const groupedRows = useMemo(
    () => groupVisitsAndVisitTimeRows(periodizedRows),
    [periodizedRows]
  );

  const drgRows = useMemo(
    () => calculateDrgRows(periodizedRows),
    [periodizedRows]
  );

  const options = useMemo(
    () => buildProductionPlanningResultOptions(resultRows),
    [resultRows]
  );

  const summary = useMemo(
    () => calculateProductionPlanningResultSummary(periodizedRows),
    [periodizedRows]
  );

  function handleFilterChange(
    field: keyof ProductionPlanningResultFilters,
    value: string
  ) {
    setFilters((current) => ({ ...current, [field]: value }));
  }

  function clearFilters() {
    setFilters(initialProductionResultFilters);
  }

  return {
    clearFilters,
    drgRows,
    errorMessage,
    filters,
    groupedRows,
    handleFilterChange,
    isLoading,
    options,
    resultRows,
    summary,
  };
}
