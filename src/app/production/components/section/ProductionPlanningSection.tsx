"use client";

import { useState } from "react";
import { Card, CardContent, Stack, Typography } from "@mui/material";
import { ProductionRowForm } from "../forms/productionRowForm";
import { ProductionRowsTable } from "../tables/productionRowsTable";

export function ProductionPlanningSection() {
    const [refreshKey, setRefreshKey] = useState(0);

    function refreshRows() {
        setRefreshKey((currentValue) => currentValue + 1);
    }

    return (
        <Stack spacing={3}>
            <Card>
                <CardContent>
                    <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                        Lägg till produktionsrad
                    </Typography>

                    <ProductionRowForm onCreated={refreshRows} />
                </CardContent>
            </Card>

            <ProductionRowsTable key={refreshKey} />
        </Stack>
    );
}