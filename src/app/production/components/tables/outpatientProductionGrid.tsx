"use client";

import { useEffect, useState } from "react";
import {
    Alert,
    Box,
    CircularProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import type { OutpatientProductionRow } from "@/types/production";

export function OutpatientProductionGrid() {
    const [rows, setRows] = useState<OutpatientProductionRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        async function fetchRows() {
            try {
                const response = await fetch("/api/production-rows");

                if (!response.ok) {
                    throw new Error("Kunde inte hämta öppenvårdsrader.");
                }

                const data = (await response.json()) as OutpatientProductionRow[];
                setRows(data);
            } catch {
                setErrorMessage("Något gick fel vid hämtning av öppenvårdsrader.");
            } finally {
                setIsLoading(false);
            }
        }

        fetchRows();
    }, []);

    if (isLoading) {
        return <CircularProgress />;
    }

    if (errorMessage) {
        return <Alert severity="error">{errorMessage}</Alert>;
    }

    return (
        <Paper sx={{ overflow: "hidden", border: "1px solid #d0d7de" }}>
            <Box sx={{ p: 1, borderBottom: "1px solid #d0d7de" }}>
                <Typography sx={{ fontWeight: 700 }}>
                    Produktionsplan - Vårdhändelser öppenvård
                </Typography>
            </Box>

            <TableContainer sx={{ maxHeight: 620, overflow: "auto" }}>
                <Table stickyHeader size="small" aria-label="Vårdhändelser öppenvård">
                    <TableHead>
                        <TableRow>
                            <TableCell rowSpan={2} sx={headerCellSx}>
                                Rad
                            </TableCell>

                            <TableCell colSpan={6} sx={groupHeaderCellSx}>
                                Grundinformation
                            </TableCell>

                            <TableCell colSpan={2} sx={groupHeaderCellSx}>
                                Angelägenhetsgrad %
                            </TableCell>

                            <TableCell colSpan={2} sx={groupHeaderCellSx}>
                                Länstillhörighet %
                            </TableCell>

                            <TableCell colSpan={4} sx={groupHeaderCellSx}>
                                Yrkesgrupp %
                            </TableCell>

                            <TableCell colSpan={2} sx={groupHeaderCellSx}>
                                Periodisering vecka
                            </TableCell>
                        </TableRow>

                        <TableRow>
                            <TableCell sx={headerCellSx}>Kombika PF_ID</TableCell>
                            <TableCell sx={headerCellSx}>Kombika PF</TableCell>
                            <TableCell sx={headerCellSx}>Sektion</TableCell>
                            <TableCell sx={headerCellSx}>Kostnadsställe</TableCell>
                            <TableCell sx={headerCellSx}>Site</TableCell>
                            <TableCell sx={headerCellSx}>Uppdrag</TableCell>

                            <TableCell sx={headerCellSx}>Akut</TableCell>
                            <TableCell sx={headerCellSx}>Elektivt</TableCell>

                            <TableCell sx={headerCellSx}>SLL</TableCell>
                            <TableCell sx={headerCellSx}>UULP</TableCell>

                            <TableCell sx={headerCellSx}>Läkare</TableCell>
                            <TableCell sx={headerCellSx}>Sjuksköterska</TableCell>
                            <TableCell sx={headerCellSx}>Hälso-profession</TableCell>
                            <TableCell sx={headerCellSx}>Övrig personal</TableCell>

                            <TableCell sx={headerCellSx}>ID</TableCell>
                            <TableCell sx={headerCellSx}>ID-Beskrivning</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {rows.map((row) => (
                            <TableRow key={row.id} hover>
                                <TableCell sx={rowLabelCellSx}>{row.row_label}</TableCell>

                                <TableCell sx={bodyCellSx}>{row.kombika_pf_id}</TableCell>
                                <TableCell sx={bodyCellSx}>{row.kombika_pf}</TableCell>
                                <TableCell sx={bodyCellSx}>{row.section}</TableCell>
                                <TableCell sx={bodyCellSx}>{row.cost_center}</TableCell>
                                <TableCell sx={bodyCellSx}>{row.site}</TableCell>
                                <TableCell sx={bodyCellSx}>{row.assignment}</TableCell>

                                <TableCell sx={bodyCellSx}>{row.acute_percentage}</TableCell>
                                <TableCell sx={bodyCellSx}>{row.elective_percentage}</TableCell>

                                <TableCell sx={bodyCellSx}>{row.sll_percentage}</TableCell>
                                <TableCell sx={bodyCellSx}>{row.uulp_percentage}</TableCell>

                                <TableCell sx={bodyCellSx}>{row.doctor_percentage}</TableCell>
                                <TableCell sx={bodyCellSx}>{row.nurse_percentage}</TableCell>
                                <TableCell sx={bodyCellSx}>
                                    {row.health_professional_percentage}
                                </TableCell>
                                <TableCell sx={bodyCellSx}>
                                    {row.other_staff_percentage}
                                </TableCell>

                                <TableCell sx={bodyCellSx}>{row.periodization_key_id}</TableCell>
                                <TableCell sx={bodyCellSx}>
                                    {row.periodization_key_description}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
}

const groupHeaderCellSx = {
    bgcolor: "#f6f5f4",
    color: "#005883",
    fontWeight: 700,
    border: "1px solid #c7d0d9",
    textAlign: "center",
    whiteSpace: "nowrap",
};

const headerCellSx = {
    bgcolor: "#ffffff",
    color: "#005883",
    fontWeight: 700,
    border: "1px solid #c7d0d9",
    whiteSpace: "nowrap",
    minWidth: 110,
};

const rowLabelCellSx = {
    bgcolor: "#f6f5f4",
    color: "#005883",
    fontWeight: 700,
    border: "1px solid #c7d0d9",
    whiteSpace: "nowrap",
};

const bodyCellSx = {
    border: "1px solid #d8dee4",
    minWidth: 110,
    whiteSpace: "nowrap",
};
