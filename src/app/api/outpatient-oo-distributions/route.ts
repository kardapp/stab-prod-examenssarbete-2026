import { NextResponse } from "next/server";
import type { PoolClient } from "pg";
import { db } from "@/lib/db/db";

type SaveOoDistributionPayload = {
  productionRowId?: number;
  distributions?: Array<{
    productionRowId?: number | null;
    careUnitId?: string;
    careUnit?: string;
    percentage?: string | number;
    roleAllocations?: Array<{
      primaryRoleCategory?: string;
      secondaryRoleCategory?: string;
      rolePercentage?: string | number;
    }>;
  }>;
};

type SanitizedRoleAllocation = {
  primaryRoleCategory: string;
  secondaryRoleCategory?: string;
  rolePercentage: number;
  roleVisits: number;
};

type SanitizedDistributionRow = {
  productionRowId: number;
  careUnitId: string;
  careUnit: string;
  percentage: number;
  visits: number;
  roleAllocations: SanitizedRoleAllocation[];
};

export async function GET(request: Request) {
  try {
    await ensureOoDistributionTable();

    const { searchParams } = new URL(request.url);
    const productionRowId = searchParams.get("productionRowId");
    const productionPlanId = searchParams.get("productionPlanId");
    const conditions: string[] = [];
    const params: Array<number | string> = [];

    if (productionRowId) {
      params.push(Number(productionRowId));
      conditions.push(`distributions.production_row_id = $${params.length}`);
    }

    if (productionPlanId) {
      params.push(Number(productionPlanId));
      conditions.push(`rows.production_plan_id = $${params.length}`);
    }

    if (!productionRowId && !productionPlanId) {
      conditions.push(
        `plans.year = (SELECT MAX(year) FROM production_plans)`
      );
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const result = await db.query(
      `
        SELECT
          distributions.id,
          distributions.production_row_id,
          distributions.distribution_order,
          distributions.care_unit_id,
          distributions.care_unit,
          distributions.distribution_percentage,
          distributions.visits
        FROM outpatient_oo_distributions AS distributions
        INNER JOIN outpatient_production_rows AS rows
          ON distributions.production_row_id = rows.id
        LEFT JOIN production_plans AS plans
          ON rows.production_plan_id = plans.id
        ${whereClause}
        ORDER BY distributions.production_row_id ASC,
          distributions.distribution_order ASC,
          distributions.id ASC
      `,
      params
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Failed to fetch outpatient OO distributions:", error);

    return NextResponse.json(
      { message: "Failed to fetch outpatient OO distributions." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  let client: PoolClient | null = null;

  try {
    await ensureOoDistributionTable();

    const body = (await request.json()) as SaveOoDistributionPayload;
    const fallbackProductionRowId = Number(body.productionRowId ?? 0);
    const requestedProductionRowIds = Array.from(
      new Set(
        (body.distributions ?? [])
          .map((distribution) =>
            Number(distribution.productionRowId ?? fallbackProductionRowId)
          )
          .filter((id) => id > 0)
      )
    );

    if (requestedProductionRowIds.length === 0) {
      return NextResponse.json(
        { message: "Missing production row id." },
        { status: 400 }
      );
    }

    const productionRowResult = await db.query(
      `
        SELECT id, visits, annual_volume, period_type
        FROM outpatient_production_rows
        WHERE id = ANY($1::int[])
      `,
      [requestedProductionRowIds]
    );

    if (productionRowResult.rowCount !== requestedProductionRowIds.length) {
      return NextResponse.json(
        { message: "One or more outpatient production rows were not found." },
        { status: 404 }
      );
    }

    const incompleteDistribution = (body.distributions ?? []).some(
      (distribution) =>
        toNumber(distribution.percentage) > 0 &&
        (!Number(distribution.productionRowId ?? fallbackProductionRowId) ||
          !distribution.careUnitId?.trim() ||
          !distribution.careUnit?.trim())
    );

    if (incompleteDistribution) {
      return NextResponse.json(
        { message: "OO distribution rows must include production row and care unit." },
        { status: 400 }
      );
    }

    const productionRowsById = new Map(
      productionRowResult.rows.map((row) => [Number(row.id), row])
    );
    const distributions = sanitizeDistributions(
      body.distributions ?? [],
      productionRowsById,
      fallbackProductionRowId
    );

    for (const productionRowId of requestedProductionRowIds) {
      const percentageTotal = distributions
        .filter((distribution) => distribution.productionRowId === productionRowId)
        .reduce((sum, distribution) => sum + distribution.percentage, 0);

      if (Math.abs(percentageTotal - 100) > 0.01) {
        return NextResponse.json(
          { message: "OO distribution must add up to 100 percent per production row." },
          { status: 400 }
        );
      }
    }

    const status = "Fördelad";
    const savedRows = [];

    client = await db.connect();
    await client.query("BEGIN");
    await client.query(
      `
        DELETE FROM outpatient_oo_distributions
        WHERE production_row_id = ANY($1::int[])
      `,
      [requestedProductionRowIds]
    );

    for (const [index, distribution] of distributions.entries()) {
      const result = await client.query(
        `
          INSERT INTO outpatient_oo_distributions (
            production_row_id,
            distribution_order,
            care_unit_id,
            care_unit,
            distribution_percentage,
            visits
          )
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING
            id,
            production_row_id,
            distribution_order,
            care_unit_id,
            care_unit,
            distribution_percentage,
            visits
        `,
        [
          distribution.productionRowId,
          index,
          distribution.careUnitId || null,
          distribution.careUnit,
          distribution.percentage,
          distribution.visits,
        ]
      );

      const distributionId = result.rows[0].id;

      if (distribution.roleAllocations && distribution.roleAllocations.length > 0) {
        for (const role of distribution.roleAllocations) {
          await client.query(
            `
              INSERT INTO outpatient_oo_distribution_role_allocations (
                distribution_id,
                primary_role_category,
                secondary_role_category,
                role_percentage,
                role_visits
              )
              VALUES ($1, $2, $3, $4, $5)
            `,
            [
              distributionId,
              role.primaryRoleCategory,
              role.secondaryRoleCategory || null,
              role.rolePercentage,
              role.roleVisits,
            ]
          );
        }
      }

      savedRows.push(result.rows[0]);
    }

    await client.query(
      `
        UPDATE outpatient_production_rows
        SET oo_distribution_status = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ANY($2::int[])
      `,
      [status, requestedProductionRowIds]
    );
    await client.query("COMMIT");

    return NextResponse.json({ status, distributions: savedRows });
  } catch (error) {
    if (client) {
      await client.query("ROLLBACK");
    }

    console.error("Failed to save outpatient OO distributions:", error);

    return NextResponse.json(
      { message: "Failed to save outpatient OO distributions." },
      { status: 500 }
    );
  } finally {
    client?.release();
  }
}

async function ensureOoDistributionTable() {
  await db.query(`
    ALTER TABLE outpatient_production_rows
      ADD COLUMN IF NOT EXISTS oo_distribution_status TEXT DEFAULT 'Ej fördelad'
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS outpatient_oo_distributions (
      id SERIAL PRIMARY KEY,
      production_row_id INTEGER NOT NULL REFERENCES outpatient_production_rows(id) ON DELETE CASCADE,
      distribution_order INTEGER NOT NULL DEFAULT 0,
      care_unit_id TEXT,
      care_unit TEXT NOT NULL,
      distribution_percentage NUMERIC(5,2) DEFAULT 0,
      visits NUMERIC(12,2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    ALTER TABLE outpatient_oo_distributions
      ADD COLUMN IF NOT EXISTS care_unit_id TEXT
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS outpatient_oo_distribution_role_allocations (
      id SERIAL PRIMARY KEY,
      distribution_id INTEGER NOT NULL REFERENCES outpatient_oo_distributions(id) ON DELETE CASCADE,
      primary_role_category TEXT NOT NULL,
      secondary_role_category TEXT,
      role_percentage NUMERIC(5,2) DEFAULT 0,
      role_visits NUMERIC(12,2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

function sanitizeDistributions(
  distributions: SaveOoDistributionPayload["distributions"],
  productionRowsById: Map<number, {
    visits?: string | number | null;
    annual_volume?: string | number | null;
    period_type?: string | null;
  }>,
  fallbackProductionRowId: number
): SanitizedDistributionRow[] {
  return (distributions ?? [])
    .map((distribution) => {
      const percentage = toNumber(distribution.percentage);
      const productionRowId = Number(
        distribution.productionRowId ?? fallbackProductionRowId
      );
      const productionRow = productionRowsById.get(productionRowId);
      const careUnitId = distribution.careUnitId?.trim() ?? "";
      const productionVisits = productionRow ? getAnnualVisits(productionRow) : 0;
      const distributionVisits = (productionVisits * percentage) / 100;
      const roleAllocations = (distribution.roleAllocations ?? [])
        .map((role) => {
          const rolePercentage = toNumber(role.rolePercentage);

          return {
            primaryRoleCategory: role.primaryRoleCategory?.trim() ?? "",
            secondaryRoleCategory:
              role.secondaryRoleCategory?.trim() || undefined,
            rolePercentage,
            roleVisits: (distributionVisits * rolePercentage) / 100,
          };
        })
        .filter(
          (role) => role.primaryRoleCategory && role.rolePercentage > 0
        );

      return {
        productionRowId,
        careUnitId,
        careUnit: distribution.careUnit?.trim() ?? "",
        percentage,
        visits: distributionVisits,
        roleAllocations,
      };
    })
    .filter(
      (distribution) =>
        distribution.productionRowId &&
        distribution.careUnitId &&
        distribution.careUnit &&
        distribution.percentage > 0
    );
}

function toNumber(value: string | number | null | undefined): number {
  const numericValue = Number(value ?? 0);

  return Number.isFinite(numericValue) ? numericValue : 0;
}

function getAnnualVisits(row: {
  visits?: string | number | null;
  annual_volume?: string | number | null;
  period_type?: string | null;
}): number {
  const visits = toNumber(row.visits);
  const annualVolume = toNumber(row.annual_volume);

  if (row.period_type && row.period_type !== "year" && annualVolume > 0) {
    return annualVolume;
  }

  return visits;
}
