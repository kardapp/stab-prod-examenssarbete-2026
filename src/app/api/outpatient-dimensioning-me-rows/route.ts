import { NextResponse } from "next/server";
import { db } from "@/lib/db/db";

type DimensioningRowPayload = {
  id?: number;
  productionRowId?: number | null;
  competenceLevel: string;
  careType?: string;
  productionSharePercentage?: string | number;
  weeklyWorkHours?: string | number;
  dayCareCalculationMethod?: string;
  keyRatio?: string | number;
  manualPresence?: string | number;
  nonContributingStPresence?: string | number;
  adminOtherPresence?: string | number;
  salaryCostPerPresence?: string | number;
  comment?: string;
  periodizationType?: string;
};

type SaveDimensioningRowsPayload = {
  productionPlanId?: number;
  kombikaId?: string;
  careType?: string;
  rows?: DimensioningRowPayload[];
};

export async function GET(request: Request) {
  try {
    await ensureDimensioningTable();

    const { searchParams } = new URL(request.url);
    const productionPlanId = searchParams.get("productionPlanId");
    const kombikaId = searchParams.get("kombikaId");
    const careType = searchParams.get("careType");
    const conditions: string[] = [];
    const params: Array<number | string> = [];

    if (productionPlanId) {
      params.push(Number(productionPlanId));
      conditions.push(`production_plan_id = $${params.length}`);
    }

    if (kombikaId !== null) {
      params.push(kombikaId);
      conditions.push(`kombika_pf_id = $${params.length}`);
    }

    if (careType) {
      params.push(careType);
      conditions.push(`care_type = $${params.length}`);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const result = await db.query(
      `
        SELECT
          id,
          production_plan_id,
          production_row_id,
          kombika_pf_id,
          competence_level,
          care_type,
          production_share_percentage,
          weekly_work_hours,
          day_care_calculation_method,
          key_ratio,
          manual_presence,
          non_contributing_st_presence,
          admin_other_presence,
          salary_cost_per_presence,
          comment,
          periodization_type
        FROM dimensionering_me_opv_rows
        ${whereClause}
        ORDER BY
          CASE competence_level
            WHEN 'ÖL' THEN 1
            WHEN 'BÖL' THEN 2
            WHEN 'SPEC' THEN 3
            WHEN 'ST/LEG' THEN 4
            WHEN 'UL' THEN 5
            ELSE 6
          END
      `,
      params
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Failed to fetch ME outpatient dimensioning rows:", error);

    return NextResponse.json(
      { message: "Failed to fetch ME outpatient dimensioning rows." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await ensureDimensioningTable();

    const body = (await request.json()) as SaveDimensioningRowsPayload;
    const productionPlanId = Number(body.productionPlanId);
    const kombikaId = body.kombikaId ?? "";
    const careType = body.careType ?? "mottagning";
    const rows = body.rows ?? [];

    if (!productionPlanId || rows.length === 0) {
      return NextResponse.json(
        { message: "Missing dimensioning rows or production plan id." },
        { status: 400 }
      );
    }

    await db.query("BEGIN");

    try {
      for (const row of rows) {
        await db.query(
          `
            INSERT INTO dimensionering_me_opv_rows (
              production_plan_id,
              production_row_id,
              kombika_pf_id,
              competence_level,
              care_type,
              production_share_percentage,
              weekly_work_hours,
              day_care_calculation_method,
              key_ratio,
              manual_presence,
              non_contributing_st_presence,
              admin_other_presence,
              salary_cost_per_presence,
              comment,
              periodization_type
            )
            VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8,
              $9, $10, $11, $12, $13, $14, $15
            )
            ON CONFLICT (
              production_plan_id,
              kombika_pf_id,
              care_type,
              competence_level
            )
            DO UPDATE SET
              production_row_id = EXCLUDED.production_row_id,
              production_share_percentage = EXCLUDED.production_share_percentage,
              weekly_work_hours = EXCLUDED.weekly_work_hours,
              day_care_calculation_method = EXCLUDED.day_care_calculation_method,
              key_ratio = EXCLUDED.key_ratio,
              manual_presence = EXCLUDED.manual_presence,
              non_contributing_st_presence = EXCLUDED.non_contributing_st_presence,
              admin_other_presence = EXCLUDED.admin_other_presence,
              salary_cost_per_presence = EXCLUDED.salary_cost_per_presence,
              comment = EXCLUDED.comment,
              periodization_type = EXCLUDED.periodization_type,
              updated_at = CURRENT_TIMESTAMP
          `,
          [
            productionPlanId,
            row.productionRowId ?? null,
            kombikaId,
            row.competenceLevel,
            row.careType ?? careType,
            toNullableNumber(row.productionSharePercentage),
            toNullableNumber(row.weeklyWorkHours),
            row.dayCareCalculationMethod ?? "calculate_as_outpatient",
            toNullableNumber(row.keyRatio),
            toNullableNumber(row.manualPresence),
            toNullableNumber(row.nonContributingStPresence),
            toNullableNumber(row.adminOtherPresence),
            toNullableNumber(row.salaryCostPerPresence),
            row.comment ?? "",
            row.periodizationType ?? "day",
          ]
        );
      }

      await db.query("COMMIT");
    } catch (error) {
      await db.query("ROLLBACK");
      throw error;
    }

    const result = await db.query(
      `
        SELECT
          id,
          production_plan_id,
          production_row_id,
          kombika_pf_id,
          competence_level,
          care_type,
          production_share_percentage,
          weekly_work_hours,
          day_care_calculation_method,
          key_ratio,
          manual_presence,
          non_contributing_st_presence,
          admin_other_presence,
          salary_cost_per_presence,
          comment,
          periodization_type
        FROM dimensionering_me_opv_rows
        WHERE production_plan_id = $1
          AND kombika_pf_id = $2
          AND care_type = $3
        ORDER BY
          CASE competence_level
            WHEN 'ÖL' THEN 1
            WHEN 'BÖL' THEN 2
            WHEN 'SPEC' THEN 3
            WHEN 'ST/LEG' THEN 4
            WHEN 'UL' THEN 5
            ELSE 6
          END
      `,
      [productionPlanId, kombikaId, careType]
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Failed to save ME outpatient dimensioning rows:", error);

    return NextResponse.json(
      { message: "Failed to save ME outpatient dimensioning rows." },
      { status: 500 }
    );
  }
}

async function ensureDimensioningTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS dimensionering_me_opv_rows (
      id SERIAL PRIMARY KEY,
      production_plan_id INTEGER NOT NULL REFERENCES production_plans(id),
      production_row_id INTEGER REFERENCES outpatient_production_rows(id),
      kombika_pf_id TEXT NOT NULL DEFAULT '',
      competence_level TEXT NOT NULL,
      care_type TEXT NOT NULL,
      production_share_percentage NUMERIC(5,2) DEFAULT 0,
      weekly_work_hours NUMERIC(6,2) DEFAULT 40,
      day_care_calculation_method TEXT DEFAULT 'calculate_as_outpatient',
      key_ratio NUMERIC(10,2),
      manual_presence NUMERIC(10,2),
      non_contributing_st_presence NUMERIC(10,2) DEFAULT 0,
      admin_other_presence NUMERIC(10,2) DEFAULT 0,
      salary_cost_per_presence NUMERIC(12,2) DEFAULT 0,
      comment TEXT,
      periodization_type TEXT DEFAULT 'day',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (production_plan_id, kombika_pf_id, care_type, competence_level)
    )
  `);

  await db.query(`
    ALTER TABLE dimensionering_me_opv_rows
      ADD COLUMN IF NOT EXISTS admin_other_presence NUMERIC(10,2) DEFAULT 0
  `);
}

function toNullableNumber(
  value: string | number | null | undefined
): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : null;
}
