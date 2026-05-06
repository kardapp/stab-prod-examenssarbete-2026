import { NextResponse } from "next/server";
import { db } from "@/lib/db/db";

export async function GET() {
    try {
        const result = await db.query(`
    SELECT
        production_rows.id,
        production_rows.production_plan_id,
        production_rows.role_category,
        production_rows.visits_per_week,
        production_rows.average_minutes_per_visit
    FROM production_rows
    ORDER BY production_rows.id ASC
    `);

        return NextResponse.json(result.rows);
    } catch (error) {
        console.error("Failed to fetch production rows:", error);

        return NextResponse.json(
            { message: "Failed to fetch production rows." },
            { status: 500 }
        );
    }
}