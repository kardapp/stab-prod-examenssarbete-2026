import { NextResponse } from "next/server";
import type { PoolClient } from "pg";
import { calculateAnnualVolumeFromVisits } from "@/features/outpatient-production/utils/outpatient-production-calculations";
import { db } from "@/lib/db/db";

type CreateOutpatientProductionRowPayload = {
  id?: number;
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
  visit_type?: string;
  visits?: number;
  primary_role_category?: string;
  secondary_role_category?: string;
  sll_uulp?: string;
  acute_elective?: string;
  average_minutes_per_visit?: number;
  drg_average?: number;
};

export async function GET(request: Request) {
  try {
    await ensureOutpatientProductionRowSchema();

    const { searchParams } = new URL(request.url);
    const conditions: string[] = [];
    const params: Array<number | string> = [];
    const productionPlanId = searchParams.get("productionPlanId");
    const kombikaId = searchParams.get("kombikaId");
    const year = searchParams.get("year");
    const careType = searchParams.get("careType");
    const dayCareCondition = `
      (
        LOWER(COALESCE(rows.care_type, '')) IN ('day_care', 'dagvard', 'dagvård')
        OR LOWER(COALESCE(rows.kombika_pf, '')) LIKE '%dagv%'
        OR LOWER(COALESCE(rows.kombika_pf_id, '')) ~ '(^|[-_])0?3($|[-_])'
      )
    `;

    if (productionPlanId) {
      params.push(Number(productionPlanId));
      conditions.push(`rows.production_plan_id = $${params.length}`);
    }

    if (kombikaId) {
      params.push(kombikaId);
      conditions.push(`rows.kombika_pf_id = $${params.length}`);
    }

    if (year) {
      params.push(Number(year));
      conditions.push(`plans.year = $${params.length}`);
    }

    if (!productionPlanId && !year) {
      conditions.push(
        `plans.year = (SELECT MAX(year) FROM production_plans)`
      );
    }

    if (careType === "dagvard") {
      conditions.push(dayCareCondition);
    } else if (careType === "mottagning") {
      conditions.push(`NOT ${dayCareCondition}`);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const result = await db.query(
      `
      SELECT
        rows.id,
        rows.production_plan_id,
        plans.year AS production_plan_year,
        plans.care_type AS production_plan_care_type,
        organization_units.name AS organization_name,
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
        rows.visit_type,
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
        comparison.r12_presence_fouu,
        comparison.r12_presence_production,
        comparison.r12_salary_cost_per_presence,
        comparison.previous_year_outcome,
        comparison.previous_dimensioning_presence,
        comparison.source AS comparison_source
      FROM outpatient_production_rows AS rows
      LEFT JOIN production_plans AS plans
        ON rows.production_plan_id = plans.id
      LEFT JOIN organization_units
        ON plans.organization_unit_id = organization_units.id
      LEFT JOIN outpatient_comparison_values AS comparison
        ON rows.production_plan_id = comparison.production_plan_id
        AND rows.kombika_pf_id = comparison.kombika_pf_id
        AND rows.period_type = comparison.period_type
        AND rows.period_value = comparison.period_value
      ${whereClause}
      ORDER BY rows.id ASC
    `,
      params
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Failed to fetch outpatient production rows:", error);

    return NextResponse.json(
      { message: "Failed to fetch outpatient production rows." },
      { status: 500 }
    );
  }
}

async function ensureOutpatientProductionRowSchema() {
  await db.query(`
    ALTER TABLE outpatient_production_rows
      ALTER COLUMN period_type SET DEFAULT 'year'
  `);

  await db.query(`
    ALTER TABLE outpatient_production_rows
      ADD COLUMN IF NOT EXISTS oo_distribution_status TEXT DEFAULT 'Ej fördelad'
  `);

  await db.query(`
    ALTER TABLE outpatient_comparison_values
      ADD COLUMN IF NOT EXISTS r12_presence_fouu NUMERIC(8,2),
      ADD COLUMN IF NOT EXISTS r12_presence_production NUMERIC(8,2),
      ADD COLUMN IF NOT EXISTS r12_salary_cost_per_presence NUMERIC(12,2)
  `);
}

async function getProductionPlanYear(
  productionPlanId: number
): Promise<number | null> {
  const result = await db.query(
    `
      SELECT year
      FROM production_plans
      WHERE id = $1
    `,
    [productionPlanId]
  );

  return result.rows[0]?.year ?? null;
}

async function getProductionPlanYearForRow(
  productionRowId: number
): Promise<number | null> {
  const result = await db.query(
    `
      SELECT plans.year
      FROM outpatient_production_rows AS rows
      LEFT JOIN production_plans AS plans
        ON rows.production_plan_id = plans.id
      WHERE rows.id = $1
    `,
    [productionRowId]
  );

  return result.rows[0]?.year ?? null;
}

export async function POST(request: Request) {
  try {
    await ensureOutpatientProductionRowSchema();

    const body = (await request.json()) as CreateOutpatientProductionRowPayload;

    const productionPlanId = body.production_plan_id ?? 1;
    const periodType = body.period_type ?? "year";
    const productionPlanYear = await getProductionPlanYear(productionPlanId);
    const periodValue =
      body.period_value ?? (productionPlanYear ? String(productionPlanYear) : "");
    const careType = body.care_type ?? "open_care";
    const visitType = body.visit_type ?? "Nybesök";
    const visits = Number(body.visits ?? 0);
    const averageMinutesPerVisit = Number(
      body.average_minutes_per_visit ?? 0
    );
    const drgAverage = Number(body.drg_average ?? 0);

    if (
      !body.kombika_pf_id ||
      !body.kombika_pf ||
      !periodValue ||
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
          visit_type,
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
          $27, $28, $29
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
          visit_type,
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
        periodValue,
        careType,
        visitType,
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

export async function PATCH(request: Request) {
  try {
    await ensureOutpatientProductionRowSchema();

    const body = (await request.json()) as CreateOutpatientProductionRowPayload;

    if (!body.id) {
      return NextResponse.json(
        { message: "Missing outpatient production row id." },
        { status: 400 }
      );
    }

    const periodType = body.period_type ?? "year";
    const productionPlanYear = body.production_plan_id
      ? await getProductionPlanYear(body.production_plan_id)
      : await getProductionPlanYearForRow(body.id);
    const periodValue =
      body.period_value ?? (productionPlanYear ? String(productionPlanYear) : "");
    const careType = body.care_type ?? "open_care";
    const visitType = body.visit_type ?? "Nybesök";
    const visits = Number(body.visits ?? 0);
    const averageMinutesPerVisit = Number(
      body.average_minutes_per_visit ?? 0
    );
    const drgAverage = Number(body.drg_average ?? 0);

    if (
      !body.kombika_pf_id ||
      !body.kombika_pf ||
      !periodValue ||
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

    const result = await db.query(
      `
        UPDATE outpatient_production_rows
        SET
          kombika_pf_id = $1,
          kombika_pf = $2,
          section = $3,
          cost_center = $4,
          site = $5,
          assignment = $6,
          period_type = $7,
          period_value = $8,
          care_type = $9,
          visit_type = $10,
          visits = $11,
          primary_role_category = $12,
          secondary_role_category = $13,
          sll_uulp = $14,
          acute_elective = $15,
          average_minutes_per_visit = $16,
          drg_average = $17,
          annual_volume = $18,
          acute_percentage = $19,
          elective_percentage = $20,
          sll_percentage = $21,
          uulp_percentage = $22,
          drg_average_sll = $23,
          drg_average_uulp = $24,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $25
        RETURNING id
      `,
      [
        body.kombika_pf_id,
        body.kombika_pf,
        body.section ?? null,
        body.cost_center ?? null,
        body.site ?? null,
        body.assignment ?? null,
        periodType,
        periodValue,
        careType,
        visitType,
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
        body.id,
      ]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { message: "Outpatient production row not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Failed to update outpatient production row:", error);

    return NextResponse.json(
      { message: "Failed to update outpatient production row." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  let client: PoolClient | null = null;

  try {
    const { searchParams } = new URL(request.url);
    const productionPlanId = Number(searchParams.get("productionPlanId"));

    if (!productionPlanId) {
      return NextResponse.json(
        { message: "Missing production plan id." },
        { status: 400 }
      );
    }

    client = await db.connect();
    await client.query("BEGIN");

    const dimensioningTableResult = await client.query(
      "SELECT to_regclass('public.dimensionering_me_opv_rows') AS table_name"
    );
    const hasDimensioningTable = Boolean(
      dimensioningTableResult.rows[0]?.table_name
    );

    if (hasDimensioningTable) {
      await client.query(
        `
          DELETE FROM dimensionering_me_opv_rows
          WHERE production_plan_id = $1
        `,
        [productionPlanId]
      );
    }

    await client.query(
      `
        DELETE FROM outpatient_production_rows
        WHERE production_plan_id = $1
      `,
      [productionPlanId]
    );

    await client.query("COMMIT");

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (client) {
      await client.query("ROLLBACK");
    }

    console.error("Failed to delete outpatient production rows:", error);

    return NextResponse.json(
      { message: "Failed to delete outpatient production rows." },
      { status: 500 }
    );
  } finally {
    client?.release();
  }
}
