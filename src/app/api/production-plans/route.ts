import { NextResponse } from "next/server";
import { db } from "@/lib/db/db";

export async function GET() {
    try {
        const result = await db.query(`
      SELECT
        production_plans.id,
        production_plans.year,
        production_plans.care_type,
        organization_units.name AS organization_name
      FROM production_plans
      JOIN organization_units
        ON production_plans.organization_unit_id = organization_units.id
      ORDER BY production_plans.created_at DESC
    `);

        return NextResponse.json(result.rows);
    } catch (error) {
        console.error("Failed to fetch production plans:", error);

        return NextResponse.json(
            { message: "Failed to fetch production plans." },
            { status: 500 }
        );
    }
}