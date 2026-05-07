"use client";

import type { ChangeEvent } from "react";
import {
  Alert,
  Box,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { SectionTitle } from "@/components/SectionTitle";
import {
  calculateCompetencePresence,
  calculatePercentageShare,
  roundToOneDecimal,
  roundToTwoDecimals,
  roundToWholeNumber,
  toNumber,
} from "@/lib/calculations/outpatientDimensioningCalculations";
import type {
  AssumptionState,
  CompetenceLevel,
  CompetenceState,
} from "./dimensioningTypes";

type DimensioningTimeInputPanelProps = {
  assumptions: AssumptionState;
  competenceLevels: CompetenceState[];
  totalVisits: number;
  totalVisitMinutes: number;
  productionPresence: number;
  percentageSum: number;
  hasInvalidSplit: boolean;
  onAssumptionChange: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onCompetenceChange: (level: CompetenceLevel, value: string) => void;
};

export function DimensioningTimeInputPanel(
  props: DimensioningTimeInputPanelProps
) {
  return (
    <Paper sx={panelSx}>
      <SectionTitle
        overline="Inmatning"
        title="Tidsåtgång per kompetensnivå ME"
        description="Dimensioneringen utgår från besök och besökslängd från produktionsplanen."
      />

      <Box sx={basisSx}>
        <SupportValue
          label="Plan i år"
          value={`${roundToWholeNumber(props.totalVisits)} besök`}
        />
        <SupportValue
          label="Besökstid"
          value={`${roundToWholeNumber(props.totalVisitMinutes)} min`}
        />
        <SupportValue
          label="Närvarobehov mottagning"
          value={roundToTwoDecimals(props.productionPresence)}
        />
      </Box>

      <Box sx={assumptionGridSx}>
        <TextField
          label="Veckoarbetstid"
          name="weeklyWorkingHours"
          type="number"
          size="small"
          value={props.assumptions.weeklyWorkingHours}
          onChange={props.onAssumptionChange}
        />
        <TextField
          select
          label="Dagvårdsmetod"
          name="dayCareMethod"
          size="small"
          value={props.assumptions.dayCareMethod}
          onChange={props.onAssumptionChange}
        >
          <MenuItem value="calculate_as_outpatient">
            Beräkna som mottagning
          </MenuItem>
          <MenuItem value="manual_presence">
            Ange bemanning/närvaro manuellt
          </MenuItem>
        </TextField>
        <TextField
          label="Manuell dagvårdsnärvaro"
          name="manualDayCarePresence"
          type="number"
          size="small"
          value={props.assumptions.manualDayCarePresence}
          onChange={props.onAssumptionChange}
          disabled={props.assumptions.dayCareMethod !== "manual_presence"}
        />
      </Box>

      <Typography variant="body2" sx={{ mt: 2, mb: 1, color: "text.secondary" }}>
        För mottagning beräknas närvarobehov som besökstid dividerat med
        veckoarbetstid. Dagvård hanteras i MVP med metodvalet ovan.
      </Typography>

      {props.hasInvalidSplit ? (
        <Alert severity="error" sx={{ mb: 1.5 }}>
          Kompetensfördelningen måste summera till 100 %.
        </Alert>
      ) : null}

      <Table size="small" aria-label="Tidsåtgång per kompetensnivå">
        <TableHead>
          <TableRow>
            <TableCell sx={headerCellSx}>Kompetensnivå</TableCell>
            <TableCell sx={headerCellSx}>Andel %</TableCell>
            <TableCell sx={headerCellSx}>Besökstid</TableCell>
            <TableCell sx={headerCellSx}>Närvaro</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.competenceLevels.map((item) => {
            const percentage = toNumber(item.percentage);
            const visitMinutes = calculatePercentageShare(
              props.totalVisitMinutes,
              percentage
            );
            const presence = calculateCompetencePresence(
              props.productionPresence,
              percentage
            );

            return (
              <TableRow key={item.level}>
                <TableCell sx={{ fontWeight: 700 }}>{item.level}</TableCell>
                <TableCell>
                  <TextField
                    label="Andel %"
                    type="number"
                    size="small"
                    value={item.percentage}
                    onChange={(event) =>
                      props.onCompetenceChange(item.level, event.target.value)
                    }
                    sx={{ width: 110 }}
                  />
                </TableCell>
                <TableCell sx={numericCellSx}>
                  {roundToWholeNumber(visitMinutes)} min
                </TableCell>
                <TableCell sx={numericCellSx}>
                  {roundToTwoDecimals(presence)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Box sx={percentageSumSx(props.hasInvalidSplit)}>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          Summa andelar
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {roundToOneDecimal(props.percentageSum)} %
        </Typography>
      </Box>
    </Paper>
  );
}

function SupportValue(props: { label: string; value: string }) {
  return (
    <Stack spacing={0.25}>
      <Typography variant="caption" color="text.secondary">
        {props.label}
      </Typography>
      <Typography sx={{ color: "#005883", fontWeight: 700 }}>
        {props.value}
      </Typography>
    </Stack>
  );
}

const panelSx = {
  p: 2,
  border: "1px solid #d0d7de",
  borderRadius: 1,
  boxShadow: "none",
};

const basisSx = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
  gap: 1.5,
  bgcolor: "#f8fbfd",
  border: "1px solid #d0d7de",
  borderRadius: 1,
  p: 1.5,
  mb: 2,
};

const assumptionGridSx = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
  gap: 1.5,
};

const headerCellSx = {
  color: "#005883",
  fontWeight: 700,
  whiteSpace: "nowrap",
};

const numericCellSx = {
  textAlign: "right",
  whiteSpace: "nowrap",
};

function percentageSumSx(hasError: boolean) {
  return {
    display: "flex",
    justifyContent: "space-between",
    gap: 2,
    mt: 1.5,
    border: "1px solid",
    borderColor: hasError ? "error.main" : "#d0d7de",
    borderRadius: 1,
    color: hasError ? "error.main" : "text.primary",
    px: 1.5,
    py: 1,
  };
}
