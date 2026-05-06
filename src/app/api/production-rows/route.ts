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

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const productionPlanId = Number(body.productionPlanId);
        const visitsPerWeek = Number(body.visitsPerWeek);
        const averageMinutesPerVisit = Number(body.averageMinutesPerVisit);
        const roleCategory = String(body.roleCategory);

        if (
            !productionPlanId ||
            !roleCategory ||
            visitsPerWeek <= 0 ||
            averageMinutesPerVisit <= 0
        ) {
            return NextResponse.json(
                { message: "Invalid production row data." },
                { status: 400 }
            );
        }

        const result = await db.query(
            `
        INSERT INTO production_rows (
          production_plan_id,
          role_category,
          visits_per_week,
          average_minutes_per_visit
        )
        VALUES ($1, $2, $3, $4)
        RETURNING
          id,
          production_plan_id,
          role_category,
          visits_per_week,
          average_minutes_per_visit
      `,
            [
                productionPlanId,
                roleCategory,
                visitsPerWeek,
                averageMinutesPerVisit,
            ]
        );

        return NextResponse.json(result.rows[0], { status: 201 });
    } catch (error) {
        console.error("Failed to create production row:", error);

        return NextResponse.json(
            { message: "Failed to create production row." },
            { status: 500 }
        );
    }
}