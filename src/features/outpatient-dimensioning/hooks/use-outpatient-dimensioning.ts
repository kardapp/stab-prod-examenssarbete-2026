"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { OutpatientProductionRow } from "@/types/production";
import { initialDimensioningRows } from "../constants/outpatient-dimensioning-options";
import type {
  CareType,
  CompetenceLevel,
  DimensioningRowField,
  DimensioningRowState,
  DimensioningSelection,
} from "../types/outpatient-dimensioning.types";
import {
  calculateDimensioneringSummary,
  calculateDimensioningRows,
  calculateProductionBasisSummary,
  matchesCareType,
  toNumber,
} from "../utils/outpatient-dimensioning-calculations";

type SelectOption = {
  value: string;
  label: string;
};

type SavedDimensioningRow = {
  id: number;
  production_row_id: number | null;
  competence_level: CompetenceLevel;
  care_type: CareType;
  production_share_percentage: string | number | null;
  weekly_work_hours: string | number | null;
  day_care_calculation_method: DimensioningRowState["dayCareCalculationMethod"];
  key_ratio: string | number | null;
  manual_presence: string | number | null;
  non_contributing_st_presence: string | number | null;
  salary_cost_per_presence: string | number | null;
  comment: string | null;
  periodization_type: DimensioningRowState["periodizationType"];
};

export function useOutpatientDimensioning() {
  const searchParams = useSearchParams();
  const [allProductionRows, setAllProductionRows] = useState<
    OutpatientProductionRow[]
  >([]);
  const [selection, setSelection] = useState<DimensioningSelection>(() =>
    getInitialSelection(searchParams)
  );
  const [dimensioningRows, setDimensioningRows] = useState<
    DimensioningRowState[]
  >(() => applyCareType(initialDimensioningRows, selection.careType));
  const [isProductionLoading, setIsProductionLoading] = useState(true);
  const [isDimensioningLoading, setIsDimensioningLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchProductionRows() {
      try {
        const response = await fetch("/api/outpatient-production-rows", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Could not fetch production basis.");
        }

        const data = (await response.json()) as OutpatientProductionRow[];
        setAllProductionRows(data);
        setSelection((current) => normalizeSelection(current, data));
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error(error);
          setErrorMessage("Något gick fel vid hämtning av produktionsunderlag.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsProductionLoading(false);
        }
      }
    }

    fetchProductionRows();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const productionPlanId = Number(selection.productionPlanId);

    if (!productionPlanId) {
      return;
    }

    const controller = new AbortController();

    async function fetchDimensioningRows() {
      setIsDimensioningLoading(true);

      try {
        const params = new URLSearchParams({
          productionPlanId: String(productionPlanId),
          kombikaId: selection.kombikaId,
          careType: selection.careType,
        });
        const response = await fetch(
          `/api/outpatient-dimensioning-me-rows?${params.toString()}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Could not fetch dimensioning rows.");
        }

        const data = (await response.json()) as SavedDimensioningRow[];
        setDimensioningRows(
          mergeSavedDimensioningRows(data, selection.careType)
        );
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error(error);
          setErrorMessage("Något gick fel vid hämtning av dimensionering.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsDimensioningLoading(false);
        }
      }
    }

    fetchDimensioningRows();

    return () => controller.abort();
  }, [selection.careType, selection.kombikaId, selection.productionPlanId]);

  const filteredProductionRows = useMemo(
    () =>
      allProductionRows.filter((row) =>
        matchesSelection(row, selection)
      ),
    [allProductionRows, selection]
  );

  const basisOptions = useMemo(
    () => buildBasisOptions(allProductionRows, selection),
    [allProductionRows, selection]
  );

  const productionBasis = useMemo(
    () =>
      calculateProductionBasisSummary(
        filteredProductionRows,
        selection.careType
      ),
    [filteredProductionRows, selection.careType]
  );

  const dimensioningCalculations = useMemo(
    () =>
      calculateDimensioningRows({
        rows: dimensioningRows,
        productionBasis,
      }),
    [dimensioningRows, productionBasis]
  );

  const summary = useMemo(
    () => calculateDimensioneringSummary(dimensioningCalculations),
    [dimensioningCalculations]
  );

  const productionShareSum = useMemo(
    () =>
      dimensioningRows.reduce(
        (sum, row) => sum + toNumber(row.productionSharePercentage),
        0
      ),
    [dimensioningRows]
  );

  function handleSelectionChange(
    field: keyof DimensioningSelection,
    value: string
  ) {
    setSaveMessage("");

    if (field === "careType") {
      const careType = parseCareType(value);

      setDimensioningRows(applyCareType(initialDimensioningRows, careType));
      setSelection((current) =>
        normalizeSelection(
          {
            ...current,
            careType,
            kombikaId: "",
          },
          allProductionRows
        )
      );
      return;
    }

    setSelection((current) => {
      if (field === "year") {
        return normalizeSelection(
          {
            ...current,
            year: value,
            productionPlanId: "",
            kombikaId: "",
          },
          allProductionRows
        );
      }

      if (field === "productionPlanId") {
        return normalizeSelection(
          {
            ...current,
            productionPlanId: value,
            kombikaId: "",
          },
          allProductionRows
        );
      }

      return normalizeSelection(
        { ...current, [field]: value },
        allProductionRows
      );
    });
  }

  function handleDimensioningRowChange(
    competenceLevel: CompetenceLevel,
    field: DimensioningRowField,
    value: string
  ) {
    setSaveMessage("");
    setDimensioningRows((current) =>
      current.map((row) =>
        row.competenceLevel === competenceLevel
          ? { ...row, [field]: value }
          : row
      )
    );
  }

  async function saveDimensioningRows() {
    const productionPlanId = Number(selection.productionPlanId);

    if (!productionPlanId) {
      setSaveMessage("Välj produktionsplan innan dimensioneringen sparas.");
      return;
    }

    setIsSaving(true);
    setSaveMessage("");

    try {
      const response = await fetch("/api/outpatient-dimensioning-me-rows", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productionPlanId,
          kombikaId: selection.kombikaId,
          careType: selection.careType,
          rows: dimensioningRows,
        }),
      });

      if (!response.ok) {
        throw new Error("Could not save dimensioning rows.");
      }

      const data = (await response.json()) as SavedDimensioningRow[];
      setDimensioningRows(mergeSavedDimensioningRows(data, selection.careType));
      setSaveMessage("Dimensioneringen är sparad.");
    } catch (error) {
      console.error(error);
      setSaveMessage("Dimensioneringen kunde inte sparas.");
    } finally {
      setIsSaving(false);
    }
  }

  return {
    basisOptions,
    dimensioningCalculations,
    dimensioningRows,
    errorMessage,
    filteredProductionRows,
    isDimensioningLoading,
    isLoading: isProductionLoading,
    isSaving,
    productionBasis,
    productionShareSum,
    saveDimensioningRows,
    saveMessage,
    selection,
    summary,
    handleDimensioningRowChange,
    handleSelectionChange,
  };
}

function getInitialSelection(
  searchParams: ReturnType<typeof useSearchParams>
): DimensioningSelection {
  return {
    productionPlanId: searchParams.get("productionPlanId") ?? "",
    kombikaId: searchParams.get("kombikaId") ?? "",
    year: searchParams.get("year") ?? "",
    careType: parseCareType(searchParams.get("careType")),
  };
}

function parseCareType(value: string | null): CareType {
  return value === "dagvard" ? "dagvard" : "mottagning";
}

function matchesSelection(
  row: OutpatientProductionRow,
  selection: DimensioningSelection
): boolean {
  if (!matchesCareType(row, selection.careType)) {
    return false;
  }

  if (
    selection.productionPlanId &&
    String(row.production_plan_id ?? "") !== selection.productionPlanId
  ) {
    return false;
  }

  if (
    selection.kombikaId &&
    String(row.kombika_pf_id ?? "") !== selection.kombikaId
  ) {
    return false;
  }

  if (selection.year && String(getRowYear(row) ?? "") !== selection.year) {
    return false;
  }

  return true;
}

function normalizeSelection(
  selection: DimensioningSelection,
  rows: OutpatientProductionRow[]
): DimensioningSelection {
  const years = getYearOptions(rows);
  const year = selection.year || years[0]?.value || "";
  const planOptions = getProductionPlanOptions(rows, year);
  const productionPlanId =
    selection.productionPlanId &&
    planOptions.some((option) => option.value === selection.productionPlanId)
      ? selection.productionPlanId
      : planOptions[0]?.value ?? "";
  const kombikaOptions = getKombikaOptions(rows, {
    ...selection,
    year,
    productionPlanId,
  });
  const kombikaId =
    selection.kombikaId &&
    kombikaOptions.some((option) => option.value === selection.kombikaId)
      ? selection.kombikaId
      : kombikaOptions[0]?.value ?? "";
  const nextSelection = {
    ...selection,
    year,
    productionPlanId,
    kombikaId,
  };

  return areSelectionsEqual(selection, nextSelection)
    ? selection
    : nextSelection;
}

function areSelectionsEqual(
  first: DimensioningSelection,
  second: DimensioningSelection
): boolean {
  return (
    first.productionPlanId === second.productionPlanId &&
    first.kombikaId === second.kombikaId &&
    first.year === second.year &&
    first.careType === second.careType
  );
}

function buildBasisOptions(
  rows: OutpatientProductionRow[],
  selection: DimensioningSelection
) {
  return {
    organizationOptions: getOrganizationOptions(rows),
    productionPlanOptions: getProductionPlanOptions(rows, selection.year),
    yearOptions: getYearOptions(rows),
    kombikaOptions: getKombikaOptions(rows, selection),
  };
}

function getOrganizationOptions(rows: OutpatientProductionRow[]): SelectOption[] {
  return uniqueOptions(
    rows.map((row) => ({
      value: row.organization_name ?? "Karolinska Universitetssjukhuset",
      label: row.organization_name ?? "Karolinska Universitetssjukhuset",
    }))
  );
}

function getYearOptions(rows: OutpatientProductionRow[]): SelectOption[] {
  return uniqueOptions(
    rows
      .map((row) => getRowYear(row))
      .filter((year): year is number => year !== null)
      .sort((first, second) => second - first)
      .map((year) => ({ value: String(year), label: String(year) }))
  );
}

function getProductionPlanOptions(
  rows: OutpatientProductionRow[],
  year: string
): SelectOption[] {
  return uniqueOptions(
    rows
      .filter((row) => !year || String(getRowYear(row) ?? "") === year)
      .map((row) => ({
        value: String(row.production_plan_id ?? ""),
        label: row.production_plan_year
          ? `Plan ${row.production_plan_id} - ${row.production_plan_year}`
          : `Plan ${row.production_plan_id}`,
      }))
      .filter((option) => option.value)
  );
}

function getKombikaOptions(
  rows: OutpatientProductionRow[],
  selection: DimensioningSelection
): SelectOption[] {
  return uniqueOptions(
    rows
      .filter((row) => matchesCareType(row, selection.careType))
      .filter(
        (row) =>
          !selection.year || String(getRowYear(row) ?? "") === selection.year
      )
      .filter(
        (row) =>
          !selection.productionPlanId ||
          String(row.production_plan_id ?? "") === selection.productionPlanId
      )
      .map((row) => ({
        value: row.kombika_pf_id ?? "",
        label: [row.kombika_pf_id, row.kombika_pf].filter(Boolean).join(" - "),
      }))
      .filter((option) => option.value)
  );
}

function getRowYear(row: OutpatientProductionRow): number | null {
  return row.production_plan_year ?? null;
}

function uniqueOptions(options: SelectOption[]): SelectOption[] {
  const optionMap = new Map<string, SelectOption>();

  options.forEach((option) => {
    if (!optionMap.has(option.value)) {
      optionMap.set(option.value, option);
    }
  });

  return Array.from(optionMap.values());
}

function applyCareType(
  rows: DimensioningRowState[],
  careType: CareType
): DimensioningRowState[] {
  return rows.map((row) => ({ ...row, careType }));
}

function mergeSavedDimensioningRows(
  savedRows: SavedDimensioningRow[],
  careType: CareType
): DimensioningRowState[] {
  const savedRowsByLevel = new Map(
    savedRows.map((row) => [row.competence_level, row])
  );

  return applyCareType(initialDimensioningRows, careType).map((defaultRow) => {
    const savedRow = savedRowsByLevel.get(defaultRow.competenceLevel);

    if (!savedRow) {
      return defaultRow;
    }

    return {
      id: savedRow.id,
      productionRowId: savedRow.production_row_id,
      competenceLevel: savedRow.competence_level,
      careType,
      productionSharePercentage: toInputValue(
        savedRow.production_share_percentage,
        defaultRow.productionSharePercentage
      ),
      weeklyWorkHours: toInputValue(
        savedRow.weekly_work_hours,
        defaultRow.weeklyWorkHours
      ),
      dayCareCalculationMethod:
        savedRow.day_care_calculation_method ??
        defaultRow.dayCareCalculationMethod,
      keyRatio: toInputValue(savedRow.key_ratio, ""),
      manualPresence: toInputValue(savedRow.manual_presence, ""),
      nonContributingStPresence: toInputValue(
        savedRow.non_contributing_st_presence,
        defaultRow.nonContributingStPresence
      ),
      salaryCostPerPresence: toInputValue(
        savedRow.salary_cost_per_presence,
        defaultRow.salaryCostPerPresence
      ),
      comment: savedRow.comment ?? "",
      periodizationType:
        savedRow.periodization_type ?? defaultRow.periodizationType,
    };
  });
}

function toInputValue(
  value: string | number | null | undefined,
  fallback: string
): string {
  if (value === null || value === undefined) {
    return fallback;
  }

  return String(value);
}
