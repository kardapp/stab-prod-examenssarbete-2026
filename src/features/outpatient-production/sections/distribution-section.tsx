"use client";

import { Box, Button, Stack, Typography } from "@mui/material";
import { FormSection } from "@/shared/components/form-section";
import { SectionCard } from "@/shared/components/section-card";
import { formatOneDecimal } from "@/shared/utils/format-number";
import { PercentageInputRow } from "../components/percentage-input-row";
import { RoleDistributionRow } from "../components/role-distribution-row";
import { ValidationMessage } from "../components/validation-message";
import type {
  OutpatientProductionCalculatedValues,
  OutpatientProductionFormState,
  OutpatientProductionValidationErrors,
  RoleDistribution,
} from "../types/outpatient-production.types";

type DistributionPercentageField =
  | "sllPercentage"
  | "uulpPercentage"
  | "acutePercentage"
  | "electivePercentage";

type DistributionSectionProps = {
  formState: OutpatientProductionFormState;
  calculatedValues: OutpatientProductionCalculatedValues;
  validationErrors: OutpatientProductionValidationErrors;
  showValidation: boolean;
  onPercentageChange: (field: DistributionPercentageField, value: number) => void;
  onRoleDistributionChange: (
    roleId: string,
    field: keyof Omit<RoleDistribution, "id">,
    value: string | number
  ) => void;
  onAddRoleDistribution: () => void;
  onRemoveRoleDistribution: (roleId: string) => void;
};

export function DistributionSection(props: DistributionSectionProps) {
  const sllUulpSum =
    props.formState.sllPercentage + props.formState.uulpPercentage;
  const acuteElectiveSum =
    props.formState.acutePercentage + props.formState.electivePercentage;
  const rolePercentageSum = props.formState.roleDistributions.reduce(
    (sum, role) => sum + role.percentage,
    0
  );

  return (
    <SectionCard>
      <FormSection
        overline="Steg 3"
        title="Procentuell fördelning av vårdtillfällen"
        description="SLL/UULP, akut/elektivt och yrkeskategorier bryter ner samma årsvolym."
      />

      <Stack spacing={3}>
        <Box sx={subSectionSx}>
          <SubSectionHeader
            title="Fördelning SLL/UULP"
            sumLabel={`Summa ${formatOneDecimal(sllUulpSum)} %`}
          />
          <Stack spacing={1.5}>
            <PercentageInputRow
              label="SLL"
              percentage={props.formState.sllPercentage}
              calculatedCareEvents={props.calculatedValues.sllCareEvents}
              onPercentageChange={(value) =>
                props.onPercentageChange("sllPercentage", value)
              }
            />
            <PercentageInputRow
              label="UULP"
              percentage={props.formState.uulpPercentage}
              calculatedCareEvents={props.calculatedValues.uulpCareEvents}
              onPercentageChange={(value) =>
                props.onPercentageChange("uulpPercentage", value)
              }
            />
          </Stack>
          <ValidationMessage
            message={
              props.showValidation ? props.validationErrors.sllUulp : undefined
            }
          />
        </Box>

        <Box sx={subSectionSx}>
          <SubSectionHeader
            title="Fördelning akut/elektivt"
            sumLabel={`Summa ${formatOneDecimal(acuteElectiveSum)} %`}
          />
          <Stack spacing={1.5}>
            <PercentageInputRow
              label="Akut"
              percentage={props.formState.acutePercentage}
              calculatedCareEvents={props.calculatedValues.acuteCareEvents}
              onPercentageChange={(value) =>
                props.onPercentageChange("acutePercentage", value)
              }
            />
            <PercentageInputRow
              label="Elektivt"
              percentage={props.formState.electivePercentage}
              calculatedCareEvents={props.calculatedValues.electiveCareEvents}
              onPercentageChange={(value) =>
                props.onPercentageChange("electivePercentage", value)
              }
            />
          </Stack>
          <ValidationMessage
            message={
              props.showValidation
                ? props.validationErrors.acuteElective
                : undefined
            }
          />
        </Box>

        <Box sx={subSectionSx}>
          <SubSectionHeader
            title="Fördelning yrkeskategori"
            sumLabel={`Summa ${formatOneDecimal(rolePercentageSum)} %`}
          />
          <Stack spacing={1.5}>
            {props.formState.roleDistributions.map((role) => {
              const result =
                props.calculatedValues.roleDistributionResults.find(
                  (item) => item.id === role.id
                );

              return (
                <RoleDistributionRow
                  key={role.id}
                  role={role}
                  calculatedCareEvents={result?.careEvents ?? 0}
                  canRemove={props.formState.roleDistributions.length > 1}
                  onChange={props.onRoleDistributionChange}
                  onRemove={props.onRemoveRoleDistribution}
                />
              );
            })}
          </Stack>
          <Box sx={{ mt: 1.5 }}>
            <Button
              type="button"
              variant="outlined"
              onClick={props.onAddRoleDistribution}
            >
              Lägg till yrkeskategori
            </Button>
          </Box>
          <ValidationMessage
            message={
              props.showValidation
                ? props.validationErrors.roleDistribution
                : undefined
            }
          />
        </Box>
      </Stack>
    </SectionCard>
  );
}

function SubSectionHeader(props: { title: string; sumLabel: string }) {
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
      <Typography variant="body2" sx={{ color: "#005883", fontWeight: 700 }}>
        {props.sumLabel}
      </Typography>
    </Stack>
  );
}

const subSectionSx = {
  borderTop: "1px solid #e5e7eb",
  pt: 2,
};
