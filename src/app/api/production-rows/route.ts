import { NextResponse } from "next/server";
import { db } from "@/lib/db/db";

export async function GET() {
    try {
        const result = await db.query(`
      SELECT
        id,
        row_label,
        kombika_pf_id,
        kombika_pf,
        section,
        cost_center,
        site,
        assignment,
        acute_percentage,
        elective_percentage,
        sll_percentage,
        uulp_percentage,
        doctor_percentage,
        nurse_percentage,
        health_professional_percentage,
        other_staff_percentage,
        periodization_key_id,
        periodization_key_description
      FROM outpatient_production_rows
      ORDER BY id ASC
    `);

        return NextResponse.json(result.rows);
    } catch (error) {
        console.error("Failed to fetch outpatient production rows:", error);

        return NextResponse.json(
            { message: "Failed to fetch outpatient production rows." },
            { status: 500 }
        );
    }
}