"use client";

import type { ChangeEvent, ReactNode } from "react";
import { useState } from "react";
import {
  Box,
  Button,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { FormSection } from "@/shared/components/form-section";
import { SectionCard } from "@/shared/components/section-card";
import { ValidationMessage } from "../components/validation-message";
import { visitTypeOptions } from "../constants/outpatient-production-options";
import type {
  DrgAverageInput,
  VisitTimeInput,
} from "../types/outpatient-production.types";

type ProductionAssumptionsSectionProps = {
  drgAverage: DrgAverageInput;
  drgAverageValidationMessage?: string;
  visitTime: VisitTimeInput;
  visitTimeValidationMessage?: string;
  onDrgAverageChange: (field: keyof DrgAverageInput, value: number) => void;
  onVisitTimeChange: (
    field: keyof VisitTimeInput,
    value: string | number
  ) => void;
};

export function ProductionAssumptionsSection(
  props: ProductionAssumptionsSectionProps
) {
  const [isVisitTimeCommentVisible, setIsVisitTimeCommentVisible] = useState(
    props.visitTime.comment.trim().length > 0
  );

  function handleVisitTypeChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    props.onVisitTimeChange("visitType", event.target.value);
  }

  function handleAverageMinutesChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    props.onVisitTimeChange("averageMinutes", Number(event.target.value));
  }

  function handleSllChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    props.onDrgAverageChange("sll", Number(event.target.value));
  }

  function handleUulpChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    props.onDrgAverageChange("uulp", Number(event.target.value));
  }

  function handleVisitTimeCommentChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    props.onVisitTimeChange("comment", event.target.value);
  }

  const hasVisitTimeComment = props.visitTime.comment.trim().length > 0;

  return (
    <SectionCard>
      <FormSection
        overline="Steg 4"
        title="Beräkningsantaganden"
      />

      <Box sx={assumptionPairGridSx}>
        <Box sx={[assumptionSubSectionSx, visitTimeSubSectionSx]}>
          <AssumptionSubSectionHeader
            title="Beräkning 1: tid per vårdhändelse"
            action={
              <Button
                type="button"
                size="small"
                variant={
                  isVisitTimeCommentVisible || hasVisitTimeComment
                    ? "contained"
                    : "outlined"
                }
                onClick={() => setIsVisitTimeCommentVisible(true)}
              >
                Kommentar
              </Button>
            }
          />

          <Box sx={subSectionGridSx}>
            <TextField
              select
              label="Typ av vårdhändelse"
              value={props.visitTime.visitType}
              onChange={handleVisitTypeChange}
              size="small"
              fullWidth
            >
              {visitTypeOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Snitt-tid per vårdhändelse"
              type="number"
              value={props.visitTime.averageMinutes}
              onChange={handleAverageMinutesChange}
              size="small"
              fullWidth
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">min</InputAdornment>
                  ),
                },
                htmlInput: {
                  min: 0,
                  step: 1,
                },
              }}
            />

            {isVisitTimeCommentVisible ? (
              <TextField
                label="Kommentar"
                value={props.visitTime.comment}
                onChange={handleVisitTimeCommentChange}
                size="small"
                fullWidth
              />
            ) : null}
          </Box>

          <ValidationMessage message={props.visitTimeValidationMessage} />
        </Box>

        <Box sx={[assumptionSubSectionSx, drgSubSectionSx]}>
          <AssumptionSubSectionHeader title="Beräkning 2: DRG-snitt" />

          <Box sx={subSectionGridSx}>
            <TextField
              label="DRG-snitt SLL"
              type="number"
              value={props.drgAverage.sll}
              onChange={handleSllChange}
              size="small"
              fullWidth
              slotProps={{
                htmlInput: {
                  min: 0,
                  step: 0.1,
                },
              }}
            />

            <TextField
              label="DRG-snitt UULP"
              type="number"
              value={props.drgAverage.uulp}
              onChange={handleUulpChange}
              size="small"
              fullWidth
              slotProps={{
                htmlInput: {
                  min: 0,
                  step: 0.1,
                },
              }}
            />
          </Box>

          <ValidationMessage message={props.drgAverageValidationMessage} />
        </Box>
      </Box>

    </SectionCard>
  );
}

function AssumptionSubSectionHeader(props: {
  action?: ReactNode;
  title: string;
}) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1}
      sx={{
        alignItems: { xs: "flex-start", sm: "baseline" },
        justifyContent: "space-between",
        mb: 1.5,
      }}
    >
      <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 700 }}>
        {props.title}
      </Typography>
      {props.action}
    </Stack>
  );
}

const assumptionPairGridSx = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    md: "repeat(2, minmax(0, 1fr))",
  },
  gap: { xs: 2, md: 2.5 },
  width: "100%",
};

const assumptionSubSectionSx = {
  bgcolor: "background.default",
  borderRight: "1px solid",
  borderRightColor: "divider",
  borderBottom: "1px solid",
  borderBottomColor: "divider",
  borderLeft: "4px solid",
  borderRadius: 1,
  pl: 2,
  pr: 2,
  py: 1.5,
};

const visitTimeSubSectionSx = {
  borderLeftColor: "primary.main",
};

const drgSubSectionSx = {
  borderLeftColor: "text.secondary",
};

const subSectionGridSx = {
  display: "grid",
  gap: 1.5,
  gridTemplateColumns: {
    xs: "1fr",
    xl: "repeat(2, minmax(0, 1fr))",
  },
};
