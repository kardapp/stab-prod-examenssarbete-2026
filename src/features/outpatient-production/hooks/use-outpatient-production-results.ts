"use client";

import { useEffect, useMemo, useState } from "react";
import type { OutpatientProductionRow } from "@/types/production";
import type { ProductionPlanningVisitTimeComment } from "../types/outpatient-production-results.types";
import type { SavedOoDistributionRow } from "../types/outpatient-oo-distribution.types";
import { comparisonValuesByKombikaId } from "../constants/outpatient-production-options";
import {
  calculateProductionPlanningComparisonRows,
  calculateProductionPlanningResultRows,
  calculateProductionPlanningResultSummary,
  periodizeProductionPlanningResultRows,
} from "../utils/outpatient-production-results-calculations";
import {
  CURRENT_OUTPATIENT_PRODUCTION_PLAN_ID,
  filterCurrentOoDistributionRows,
  filterCurrentOutpatientProductionRows,
  readCurrentOutpatientProductionRowIds,
} from "../utils/current-outpatient-production-session";

export function useOutpatientProductionResults() {
  const [productionRows, setProductionRows] = useState<OutpatientProductionRow[]>(
    []
  );
  const [ooDistributions, setOoDistributions] = useState<
    SavedOoDistributionRow[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchResultBasis() {
      try {
        const currentRowIds = readCurrentOutpatientProductionRowIds();

        if (currentRowIds.length === 0) {
          setErrorMessage("");
          setProductionRows([]);
          setOoDistributions([]);
          return;
        }

        const [productionResponse, ooDistributionResponse] = await Promise.all([
          fetch(
            `/api/outpatient-production-rows?productionPlanId=${CURRENT_OUTPATIENT_PRODUCTION_PLAN_ID}`,
            {
              signal: controller.signal,
            }
          ),
          fetch(
            `/api/outpatient-oo-distributions?productionPlanId=${CURRENT_OUTPATIENT_PRODUCTION_PLAN_ID}`,
            {
              signal: controller.signal,
            }
          ),
        ]);

        if (!productionResponse.ok || !ooDistributionResponse.ok) {
          throw new Error("Could not fetch outpatient production results.");
        }

        const [productionData, ooDistributionData] = await Promise.all([
          productionResponse.json() as Promise<OutpatientProductionRow[]>,
          ooDistributionResponse.json() as Promise<SavedOoDistributionRow[]>,
        ]);

        setErrorMessage("");
        setProductionRows(
          filterCurrentOutpatientProductionRows(productionData, currentRowIds)
        );
        setOoDistributions(
          filterCurrentOoDistributionRows(ooDistributionData, currentRowIds)
        );
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

  const comparisonRows = useMemo(
    () =>
      calculateProductionPlanningComparisonRows(
        productionRows,
        comparisonValuesByKombikaId
      ),
    [productionRows]
  );

  const periodizedRows = useMemo(
    () => periodizeProductionPlanningResultRows(resultRows, "year"),
    [resultRows]
  );

  const summary = useMemo(
    () => calculateProductionPlanningResultSummary(periodizedRows),
    [periodizedRows]
  );

  const visitTimeComments = useMemo(
    () => buildVisitTimeComments(productionRows),
    [productionRows]
  );

  return {
    annualRows: resultRows,
    comparisonRows,
    errorMessage,
    isLoading,
    resultRows,
    summary,
    visitTimeComments,
  };
}

function buildVisitTimeComments(
  productionRows: OutpatientProductionRow[]
): ProductionPlanningVisitTimeComment[] {
  const commentsByKey = new Map<string, ProductionPlanningVisitTimeComment>();

  productionRows.forEach((row) => {
    const comment = row.visit_time_comment?.trim();

    if (!comment) {
      return;
    }

    const economicKombika =
      [row.kombika_pf_id, row.kombika_pf].filter(Boolean).join(" - ") ||
      "Saknas";
    const visitType = row.visit_type ?? "Saknas";
    const averageMinutesPerVisit = Number(row.average_minutes_per_visit ?? 0);
    const key = [
      economicKombika,
      visitType,
      averageMinutesPerVisit,
      comment,
    ].join("|");
    const current = commentsByKey.get(key);

    if (current) {
      commentsByKey.set(key, {
        ...current,
        rowLabels: [...current.rowLabels, row.row_label],
      });
      return;
    }

    commentsByKey.set(key, {
      id: key,
      averageMinutesPerVisit,
      comment,
      economicKombika,
      rowLabels: [row.row_label],
      visitType,
    });
  });

  return Array.from(commentsByKey.values());
}
