"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import type { OutpatientProductionRow } from "@/types/production";
import {
  initialAssumptions,
  initialCompetenceLevels,
} from "../constants/outpatient-dimensioning-options";
import type {
  AssumptionState,
  CompetenceLevel,
  CompetenceState,
} from "../types/outpatient-dimensioning.types";
import { calculateDimensioningValues } from "../utils/outpatient-dimensioning-calculations";

export function useOutpatientDimensioning() {
  const [rows, setRows] = useState<OutpatientProductionRow[]>([]);
  const [assumptions, setAssumptions] =
    useState<AssumptionState>(initialAssumptions);
  const [competenceLevels, setCompetenceLevels] = useState<CompetenceState[]>(
    initialCompetenceLevels
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchProductionRows() {
      try {
        const response = await fetch("/api/outpatient-production-rows");

        if (!response.ok) {
          throw new Error("Could not fetch production basis.");
        }

        const data = (await response.json()) as OutpatientProductionRow[];
        setRows(data);
      } catch {
        setErrorMessage("Något gick fel vid hämtning av produktionsunderlag.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchProductionRows();
  }, []);

  const dimensioningValues = useMemo(
    () => calculateDimensioningValues(rows, assumptions, competenceLevels),
    [assumptions, competenceLevels, rows]
  );

  function handleAssumptionChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = event.target;
    setAssumptions((current) => ({ ...current, [name]: value }));
  }

  function handleCompetenceChange(level: CompetenceLevel, value: string) {
    setCompetenceLevels((current) =>
      current.map((item) =>
        item.level === level ? { ...item, percentage: value } : item
      )
    );
  }

  return {
    assumptions,
    competenceLevels,
    dimensioningValues,
    isLoading,
    errorMessage,
    handleAssumptionChange,
    handleCompetenceChange,
  };
}
