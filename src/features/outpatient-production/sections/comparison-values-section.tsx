import { Box, Typography } from "@mui/material";
import { FormSection } from "@/shared/components/form-section";
import { SectionCard } from "@/shared/components/section-card";
import { formatWholeNumber } from "@/shared/utils/format-number";
import { SummaryValueCard } from "../components/summary-value-card";
import type {
  ComparisonValues,
  KombikaOption,
} from "../types/outpatient-production.types";

type ComparisonValuesSectionProps = {
  selectedKombika: KombikaOption;
  comparisonValues: ComparisonValues | null;
};

export function ComparisonValuesSection(props: ComparisonValuesSectionProps) {
  return (
    <SectionCard>
      <FormSection
        overline="Steg 6"
        title="Jämförelsevärden"
        description="Stöddata från föregående år visas som jämförelse mot årets planerade huvudvolym."
      />

      {props.comparisonValues ? (
        <Box sx={summaryGridSx}>
          <SummaryValueCard
            label="Plan föregående år"
            value={formatWholeNumber(props.comparisonValues.previousYearPlan)}
            helperText={props.selectedKombika.code}
          />
          <SummaryValueCard
            label="Utfall föregående år"
            value={formatWholeNumber(
              props.comparisonValues.previousYearOutcome
            )}
            helperText={props.selectedKombika.code}
          />
        </Box>
      ) : (
        <Typography color="text.secondary">
          Inga jämförelsevärden finns för vald kombika.
        </Typography>
      )}
    </SectionCard>
  );
}

const summaryGridSx = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    md: "repeat(2, minmax(0, 1fr))",
  },
  gap: 1.5,
};
