import { NextResponse } from "next/server";
import { calculateAnnualVolumeFromVisits } from "@/lib/calculations/outpatientProductionCalculations";
import { db } from "@/lib/db/db";

type CreateOutpatientProductionRowPayload = {
  production_plan_id?: number;
  kombika_pf_id?: string;
  kombika_pf?: string;
  section?: string;
  cost_center?: string;
  site?: string;
  assignment?: string;
  period_type?: string;
  period_value?: string;
  care_type?: string;
  visits?: number;
  primary_role_category?: string;
  secondary_role_category?: string;
  sll_uulp?: string;
  acute_elective?: string;
  average_minutes_per_visit?: number;
  drg_average?: number;
};

export async function GET() {
  try {
    const result = await db.query(`
      SELECT
        rows.id,
        rows.production_plan_id,
        rows.row_label,
        rows.kombika_pf_id,
        rows.kombika_pf,
        rows.section,
        rows.cost_center,
        rows.site,
        rows.assignment,
        rows.period_type,
        rows.period_value,
        rows.care_type,
        rows.visits,
        rows.primary_role_category,
        rows.secondary_role_category,
        rows.sll_uulp,
        rows.acute_elective,
        rows.average_minutes_per_visit,
        rows.drg_average,
        rows.annual_volume,
        rows.acute_percentage,
        rows.elective_percentage,
        rows.sll_percentage,
        rows.uulp_percentage,
        rows.drg_average_sll,
        rows.drg_average_uulp,
        rows.doctor_percentage,
        rows.nurse_percentage,
        rows.health_professional_percentage,
        rows.other_staff_percentage,
        rows.periodization_key_id,
        rows.periodization_key_description,
        rows.oo_distribution_status,
        comparison.previous_year_plan,
        comparison.r12_outcome,
        comparison.previous_year_outcome,
        comparison.previous_dimensioning_presence,
        comparison.source AS comparison_source
      FROM outpatient_production_rows AS rows
      LEFT JOIN outpatient_comparison_values AS comparison
        ON rows.production_plan_id = comparison.production_plan_id
        AND rows.kombika_pf_id = comparison.kombika_pf_id
        AND rows.period_type = comparison.period_type
        AND rows.period_value = comparison.period_value
      ORDER BY rows.id ASC
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

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateOutpatientProductionRowPayload;

    const productionPlanId = body.production_plan_id ?? 1;
    const periodType = body.period_type ?? "week";
    const careType = body.care_type ?? "open_care";
    const visits = Number(body.visits ?? 0);
    const averageMinutesPerVisit = Number(
      body.average_minutes_per_visit ?? 0
    );
    const drgAverage = Number(body.drg_average ?? 0);

    if (
      !body.kombika_pf_id ||
      !body.kombika_pf ||
      !body.period_value ||
      !body.primary_role_category ||
      !body.sll_uulp ||
      !body.acute_elective ||
      visits <= 0 ||
      averageMinutesPerVisit <= 0
    ) {
      return NextResponse.json(
        { message: "Missing required outpatient production row fields." },
        { status: 400 }
      );
    }

    const annualVolume = calculateAnnualVolumeFromVisits(visits, periodType);
    const acutePercentage = body.acute_elective === "Akut" ? 100 : 0;
    const electivePercentage = body.acute_elective === "Elektivt" ? 100 : 0;
    const sllPercentage = body.sll_uulp === "SLL" ? 100 : 0;
    const uulpPercentage = body.sll_uulp === "UULP" ? 100 : 0;

    const nextRowResult = await db.query(
      `
        SELECT COUNT(*)::int + 1 AS next_row_number
        FROM outpatient_production_rows
        WHERE production_plan_id = $1
      `,
      [productionPlanId]
    );

    const nextRowNumber = nextRowResult.rows[0]?.next_row_number ?? 1;
    const rowLabel = `Rad ${String(nextRowNumber).padStart(2, "0")}`;

    const result = await db.query(
      `
        INSERT INTO outpatient_production_rows (
          production_plan_id,
          row_label,
          kombika_pf_id,
          kombika_pf,
          section,
          cost_center,
          site,
          assignment,
          period_type,
          period_value,
          care_type,
          visits,
          primary_role_category,
          secondary_role_category,
          sll_uulp,
          acute_elective,
          average_minutes_per_visit,
          drg_average,
          annual_volume,
          acute_percentage,
          elective_percentage,
          sll_percentage,
          uulp_percentage,
          drg_average_sll,
          drg_average_uulp,
          periodization_key_id,
          periodization_key_description,
          oo_distribution_status
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18,
          $19, $20, $21, $22, $23, $24, $25, $26,
          $27, $28
        )
        RETURNING
          id,
          production_plan_id,
          row_label,
          kombika_pf_id,
          kombika_pf,
          period_type,
          period_value,
          care_type,
          visits,
          primary_role_category,
          secondary_role_category,
          sll_uulp,
          acute_elective,
          average_minutes_per_visit,
          drg_average,
          annual_volume
      `,
      [
        productionPlanId,
        rowLabel,
        body.kombika_pf_id,
        body.kombika_pf,
        body.section ?? null,
        body.cost_center ?? null,
        body.site ?? null,
        body.assignment ?? null,
        periodType,
        body.period_value,
        careType,
        visits,
        body.primary_role_category,
        body.secondary_role_category || null,
        body.sll_uulp,
        body.acute_elective,
        averageMinutesPerVisit,
        drgAverage,
        annualVolume,
        acutePercentage,
        electivePercentage,
        sllPercentage,
        uulpPercentage,
        drgAverage,
        drgAverage,
        "P01",
        "Jämn fördelning över året",
        "Ej fördelad",
      ]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Failed to create outpatient production row:", error);

    return NextResponse.json(
      { message: "Failed to create outpatient production row." },
      { status: 500 }
    );
  }
}
