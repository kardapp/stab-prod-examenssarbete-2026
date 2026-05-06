"use client";

import { useState } from "react";
import { Button, MenuItem, Stack, TextField } from "@mui/material";

type ProductionRowFormProps = {
    onCreated: () => void;
};

export function ProductionRowForm({ onCreated }: ProductionRowFormProps) {
    const [roleCategory, setRoleCategory] = useState("Läkare");
    const [visitsPerWeek, setVisitsPerWeek] = useState("");
    const [averageMinutesPerVisit, setAverageMinutesPerVisit] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setIsSubmitting(true);

        await fetch("/api/production-rows", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                productionPlanId: 1,
                roleCategory,
                visitsPerWeek: Number(visitsPerWeek),
                averageMinutesPerVisit: Number(averageMinutesPerVisit),
            }),
        });

        setRoleCategory("Läkare");
        setVisitsPerWeek("");
        setAverageMinutesPerVisit("");
        setIsSubmitting(false);
        onCreated();
    }

    return (
        <Stack component="form" spacing={2} onSubmit={handleSubmit}>
            <TextField
                select
                label="Yrkeskategori"
                value={roleCategory}
                onChange={(event) => setRoleCategory(event.target.value)}
                required
            >
                <MenuItem value="Läkare">Läkare</MenuItem>
                <MenuItem value="Sjuksköterska">Sjuksköterska</MenuItem>
                <MenuItem value="Undersköterska">Undersköterska</MenuItem>
                <MenuItem value="Övrig">Övrig</MenuItem>
            </TextField>

            <TextField
                label="Besök per vecka"
                type="number"
                value={visitsPerWeek}
                onChange={(event) => setVisitsPerWeek(event.target.value)}
                required
            />

            <TextField
                label="Snittid per besök i minuter"
                type="number"
                value={averageMinutesPerVisit}
                onChange={(event) => setAverageMinutesPerVisit(event.target.value)}
                required
            />

            <Button type="submit" variant="contained" disabled={isSubmitting}>
                {isSubmitting ? "Sparar..." : "Spara produktionsrad"}
            </Button>
        </Stack>
    );
}