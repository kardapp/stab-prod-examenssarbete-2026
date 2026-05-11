"use client";

import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import type { OutpatientProductionRow } from "@/types/production";
import {
  initialFormState,
  kombikaOptions,
} from "../constants/outpatient-production-options";
import type { OutpatientProductionFormState } from "../types/outpatient-production.types";

export function useOutpatientProduction() {
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
          throw new Error("Could not fetch outpatient production rows.");
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
        throw new Error("Could not save outpatient production row.");
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

  return {
    rows,
    formState,
    editingRowId,
    isLoading,
    isSubmitting,
    errorMessage,
    handleFieldChange,
    handleKombikaChange,
    handleSubmit,
    handleEditRow,
    resetForm,
  };
}
