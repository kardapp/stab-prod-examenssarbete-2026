"use client";

import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { Alert, CircularProgress, Paper, Stack } from "@mui/material";
import type { OutpatientProductionRow } from "@/types/production";
import { ComparisonValuesBlock } from "./ComparisonValuesBlock";
import {
  initialFormState,
  kombikaOptions,
} from "./outpatientProductionOptions";
import type { OutpatientProductionFormState } from "./outpatientProductionTypes";
import { ProductionInputForm } from "./ProductionInputForm";
import { ProductionInputTable } from "./ProductionInputTable";
import { ProductionNavigationActions } from "./ProductionNavigationActions";

export function OutpatientProductionGrid() {
  const [rows, setRows] = useState<OutpatientProductionRow[]>([]);
  const [formState, setFormState] =
    useState<OutpatientProductionFormState>(initialFormState);
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchRows() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/outpatient-production-rows");

        if (!response.ok) {
          throw new Error("Kunde inte hämta öppenvårdsrader.");
        }

        const data = (await response.json()) as OutpatientProductionRow[];
        setRows(data);
        setErrorMessage("");
      } catch {
        setErrorMessage("Något gick fel vid hämtning av öppenvårdsrader.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchRows();
  }, [reloadToken]);

  function handleFieldChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = event.target;
    setFormState((current) => ({ ...current, [name]: value }));
  }

  function handleKombikaChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const selectedOption = kombikaOptions.find(
      (option) => option.id === event.target.value
    );

    if (!selectedOption) {
      return;
    }

    setFormState((current) => ({
      ...current,
      kombika_pf_id: selectedOption.id,
      kombika_pf: selectedOption.label,
      section: selectedOption.section,
      cost_center: selectedOption.costCenter,
      site: selectedOption.site,
      assignment: selectedOption.assignment,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/outpatient-production-rows", {
        method: editingRowId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingRowId ?? undefined,
          production_plan_id: 1,
          ...formState,
          visits: Number(formState.visits),
          average_minutes_per_visit: Number(
            formState.average_minutes_per_visit
          ),
          drg_average: Number(formState.drg_average),
        }),
      });

      if (!response.ok) {
        throw new Error("Kunde inte spara produktionsraden.");
      }

      resetForm();
      setReloadToken((current) => current + 1);
    } catch {
      setErrorMessage("Något gick fel när produktionsraden skulle sparas.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleEditRow(row: OutpatientProductionRow) {
    setEditingRowId(row.id);
    setFormState({
      kombika_pf_id: row.kombika_pf_id ?? "PF-001",
      kombika_pf: row.kombika_pf ?? "ÖPV Mottagning A",
      section: row.section ?? "",
      cost_center: row.cost_center ?? "",
      site: row.site ?? "",
      assignment: row.assignment ?? "",
      period_type: row.period_type ?? "day",
      period_value: row.period_value ?? "",
      care_type: row.care_type ?? "open_care",
      visit_type: row.visit_type ?? "Nybesök",
      visits: row.visits?.toString() ?? "",
      primary_role_category: row.primary_role_category ?? "Läkare",
      secondary_role_category: row.secondary_role_category ?? "",
      sll_uulp: row.sll_uulp ?? "SLL",
      acute_elective: row.acute_elective ?? "Elektivt",
      average_minutes_per_visit:
        row.average_minutes_per_visit?.toString() ?? "",
      drg_average: row.drg_average ?? "",
    });
  }

  function resetForm() {
    setEditingRowId(null);
    setFormState(initialFormState);
  }

  if (isLoading) {
    return (
      <Paper sx={panelSx}>
        <CircularProgress />
      </Paper>
    );
  }

  return (
    <Stack spacing={2}>
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      <ProductionInputForm
        formState={formState}
        editingRowId={editingRowId}
        isSubmitting={isSubmitting}
        onFieldChange={handleFieldChange}
        onKombikaChange={handleKombikaChange}
        onSubmit={handleSubmit}
        onReset={resetForm}
      />

      <ProductionInputTable rows={rows} onEditRow={handleEditRow} />

      <ComparisonValuesBlock rows={rows} />

      <ProductionNavigationActions />
    </Stack>
  );
}

const panelSx = {
  p: 2,
  border: "1px solid #d0d7de",
  borderRadius: 1,
  boxShadow: "none",
};
