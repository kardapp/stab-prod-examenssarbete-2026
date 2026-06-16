import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";

type OoResultRowPayload = {
  productionRowId?: number | null;
  distributionId?: number | null;
  rowType?: string;
  rowKey: string;
  kombikaId?: string;
  roleCategory: string;
  competenceLevel?: string;
  economicSection: string;
  careCostCenter: string;
  sourcePeriod: string;
  careType?: string;
  productionPresence?: number;
  adminOtherPresence?: number;
  nonContributingPresence?: number;
  totalPresence?: number;
  salaryCostPerPresence?: number;
  staffingCost?: number;
  visits?: number;
  drgTotal?: number;
};

type SaveOoResultsPayload = {
  productionPlanId?: number;
  rows?: OoResultRowPayload[];
};

export async function GET(request: Request) {
  try {
    await ensureOoResultsTable();

    const { searchParams } = new URL(request.url);
    const productionPlanId = searchParams.get("productionPlanId");
    const conditions: string[] = [];
    const params: Array<number | string> = [];

    if (productionPlanId) {
      params.push(Number(productionPlanId));
      conditions.push(`production_plan_id = $${params.length}`);
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
          distribution_id,
          row_type,
          row_key,
          kombika_pf_id,
          role_category,
          competence_level,
          economic_section,
          care_cost_center,
          source_period,
          care_type,
          production_presence,
          admin_other_presence,
          non_contributing_presence,
          total_presence,
          salary_cost_per_presence,
          staffing_cost,
          visits,
          drg_total
        FROM dimensionering_oo_opv_result_rows
        ${whereClause}
        ORDER BY row_type, role_category, care_cost_center
      `,
      params
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Failed to fetch OO outpatient dimensioning results:", error);

    return NextResponse.json(
      { message: "Failed to fetch OO outpatient dimensioning results." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await ensureOoResultsTable();

    const body = (await request.json()) as SaveOoResultsPayload;
    const productionPlanId = Number(body.productionPlanId);
    const rows = body.rows ?? [];

    if (!productionPlanId || rows.length === 0) {
      return NextResponse.json(
        { message: "Missing OO dimensioning result rows or production plan id." },
        { status: 400 }
      );
    }

    await db.query("BEGIN");

    try {
      await db.query(
        `
          DELETE FROM dimensionering_oo_opv_result_rows
          WHERE production_plan_id = $1
        `,
        [productionPlanId]
      );

      for (const row of rows) {
        const productionPresence = toNumber(row.productionPresence);
        const adminOtherPresence = toNumber(row.adminOtherPresence);
        const nonContributingPresence = 0;
        const totalPresence = productionPresence + adminOtherPresence;
        const salaryCostPerPresence = toNumber(row.salaryCostPerPresence);
        const staffingCost = totalPresence * salaryCostPerPresence;

        await db.query(
          `
            INSERT INTO dimensionering_oo_opv_result_rows (
              production_plan_id,
              production_row_id,
              distribution_id,
              row_type,
              row_key,
              kombika_pf_id,
              role_category,
              competence_level,
              economic_section,
              care_cost_center,
              source_period,
              care_type,
              production_presence,
              admin_other_presence,
              non_contributing_presence,
              total_presence,
              salary_cost_per_presence,
              staffing_cost,
              visits,
              drg_total
            )
            VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
              $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
            )
          `,
          [
            productionPlanId,
            toNullableNumber(row.productionRowId),
            toNullableNumber(row.distributionId),
            row.rowType ?? "production",
            row.rowKey,
            row.kombikaId ?? "",
            row.roleCategory,
            row.competenceLevel ?? "OO",
            row.economicSection,
            row.careCostCenter,
            row.sourcePeriod,
            row.careType ?? "mottagning",
            productionPresence,
            adminOtherPresence,
            nonContributingPresence,
            totalPresence,
            salaryCostPerPresence,
            staffingCost,
            toNumber(row.visits),
            toNumber(row.drgTotal),
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
          distribution_id,
          row_type,
          row_key,
          kombika_pf_id,
          role_category,
          competence_level,
          economic_section,
          care_cost_center,
          source_period,
          care_type,
          production_presence,
          admin_other_presence,
          non_contributing_presence,
          total_presence,
          salary_cost_per_presence,
          staffing_cost,
          visits,
          drg_total
        FROM dimensionering_oo_opv_result_rows
        WHERE production_plan_id = $1
        ORDER BY row_type, role_category, care_cost_center
      `,
      [productionPlanId]
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Failed to save OO outpatient dimensioning results:", error);

    return NextResponse.json(
      { message: "Failed to save OO outpatient dimensioning results." },
      { status: 500 }
    );
  }
}

async function ensureOoResultsTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS dimensionering_oo_opv_result_rows (
      id SERIAL PRIMARY KEY,
      production_plan_id INTEGER NOT NULL REFERENCES production_plans(id),
      production_row_id INTEGER REFERENCES outpatient_production_rows(id),
      distribution_id INTEGER,
      row_type TEXT NOT NULL,
      row_key TEXT NOT NULL,
      kombika_pf_id TEXT NOT NULL DEFAULT '',
      role_category TEXT NOT NULL,
      competence_level TEXT NOT NULL DEFAULT 'OO',
      economic_section TEXT NOT NULL DEFAULT '',
      care_cost_center TEXT NOT NULL DEFAULT '',
      source_period TEXT NOT NULL DEFAULT '',
      care_type TEXT NOT NULL DEFAULT 'mottagning',
      production_presence NUMERIC(12,4) DEFAULT 0,
      admin_other_presence NUMERIC(12,4) DEFAULT 0,
      non_contributing_presence NUMERIC(12,4) DEFAULT 0,
      total_presence NUMERIC(12,4) DEFAULT 0,
      salary_cost_per_presence NUMERIC(12,2) DEFAULT 0,
      staffing_cost NUMERIC(14,2) DEFAULT 0,
      visits NUMERIC(14,2) DEFAULT 0,
      drg_total NUMERIC(14,4) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (production_plan_id, row_key)
    )
  `);
}

function toNullableNumber(value: number | null | undefined): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  return Number.isFinite(value) ? value : null;
}

function toNumber(value: number | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }

  return Number.isFinite(value) ? value : 0;
}
