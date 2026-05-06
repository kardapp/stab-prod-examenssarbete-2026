"use client";

import { useEffect, useState } from "react";
import {
    Alert,
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
import type { ProductionRow } from "@/types/production";

export function ProductionRowsTable() {
    const [rows, setRows] = useState<ProductionRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        async function fetchProductionRows() {
            try {
                const response = await fetch("/api/production-rows");

                if (!response.ok) {
                    throw new Error("Kunde inte hämta produktionsrader.");
                }

                const data = (await response.json()) as ProductionRow[];
                setRows(data);
            } catch {
                setErrorMessage("Något gick fel vid hämtning av produktionsrader.");
            } finally {
                setIsLoading(false);
            }
        }

        fetchProductionRows();
    }, []);

    if (isLoading) {
        return <CircularProgress />;
    }

    if (errorMessage) {
        return <Alert severity="error">{errorMessage}</Alert>;
    }

    if (rows.length === 0) {
        return <Typography>Inga produktionsrader hittades.</Typography>;
    }

    return (
        <TableContainer component={Paper}>
            <Table aria-label="Produktionsrader">
                <TableHead>
                    <TableRow>
                        <TableCell>Yrkeskategori</TableCell>
                        <TableCell>Besök per vecka</TableCell>
                        <TableCell>Snittid per besök</TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {rows.map((row) => (
                        <TableRow key={row.id}>
                            <TableCell>{row.role_category}</TableCell>
                            <TableCell>{row.visits_per_week}</TableCell>
                            <TableCell>{row.average_minutes_per_visit} min</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}