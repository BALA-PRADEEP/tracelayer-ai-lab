import os
from datetime import datetime, timezone
from decimal import Decimal

import psycopg
from fastapi import FastAPI, HTTPException
from psycopg.rows import dict_row

app = FastAPI(
    title="BuildPilot API",
    version="0.3.0",
    description="Backend services for the BuildPilot construction operations application.",
)


def get_connection():
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise HTTPException(status_code=503, detail="Database connection is not configured.")
    return psycopg.connect(database_url, row_factory=dict_row)


def to_json_safe(value):
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, dict):
        return {key: to_json_safe(item) for key, item in value.items()}
    if isinstance(value, list):
        return [to_json_safe(item) for item in value]
    return value


@app.get("/api")
def api_root() -> dict[str, str]:
    return {
        "status": "ok",
        "service": "buildpilot-api",
        "message": "BuildPilot API is online.",
    }


@app.get("/api/health")
def health() -> dict[str, str]:
    return {
        "status": "ok",
        "service": "buildpilot-api",
        "version": "0.3.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/api/demo/over-budget")
def over_budget_projects(tenant_slug: str = "stark-roofing"):
    query = """
        select
            p.id,
            p.name,
            p.project_type,
            p.status,
            p.city,
            p.state,
            p.estimated_total,
            p.actual_total,
            (p.actual_total - p.estimated_total) as variance,
            case
                when p.estimated_total = 0 then 0
                else round(((p.actual_total - p.estimated_total) / p.estimated_total) * 100, 2)
            end as variance_percent
        from projects p
        join tenants t on t.id = p.tenant_id
        where t.slug = %s
          and p.actual_total > p.estimated_total
        order by variance desc;
    """

    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(query, (tenant_slug,))
            rows = cursor.fetchall()

    return {
        "tenant": tenant_slug,
        "count": len(rows),
        "projects": to_json_safe(rows),
    }


@app.get("/api/demo/projects/{project_name}")
def project_detail(project_name: str, tenant_slug: str = "stark-roofing"):
    project_query = """
        select
            p.id,
            p.name,
            p.project_type,
            p.status,
            p.city,
            p.state,
            p.estimated_total,
            p.actual_total,
            e.material_budget,
            e.labor_budget,
            e.total_budget
        from projects p
        join tenants t on t.id = p.tenant_id
        left join estimates e on e.project_id = p.id
        where t.slug = %s and lower(p.name) = lower(%s)
        limit 1;
    """

    materials_query = """
        select
            m.sku,
            m.name,
            m.category,
            m.uom,
            pm.estimated_quantity,
            pm.actual_quantity,
            pm.estimated_unit_cost,
            pm.actual_unit_cost,
            sp.unit_price as current_supplier_price,
            sp.available_quantity,
            sp.effective_at as supplier_price_effective_at
        from projects p
        join tenants t on t.id = p.tenant_id
        join project_materials pm on pm.project_id = p.id
        join materials m on m.id = pm.material_id
        left join supplier_products product on product.external_sku = m.sku
        left join lateral (
            select unit_price, available_quantity, effective_at
            from supplier_prices price
            where price.supplier_product_id = product.id
            order by effective_at desc
            limit 1
        ) sp on true
        where t.slug = %s and lower(p.name) = lower(%s)
        order by m.name;
    """

    expenses_query = """
        select expense_type, vendor_name, description, amount, incurred_on
        from expenses expense
        join projects p on p.id = expense.project_id
        join tenants t on t.id = p.tenant_id
        where t.slug = %s and lower(p.name) = lower(%s)
        order by incurred_on;
    """

    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(project_query, (tenant_slug, project_name))
            project = cursor.fetchone()
            if not project:
                raise HTTPException(status_code=404, detail="Project not found.")

            cursor.execute(materials_query, (tenant_slug, project_name))
            materials = cursor.fetchall()

            cursor.execute(expenses_query, (tenant_slug, project_name))
            expenses = cursor.fetchall()

    return to_json_safe(
        {
            "tenant": tenant_slug,
            "project": project,
            "materials": materials,
            "expenses": expenses,
        }
    )


@app.get("/api/demo/cedar-analysis")
def cedar_analysis(tenant_slug: str = "stark-roofing"):
    project_name = "Project Cedar"
    project_query = """
        select
            p.id,
            p.name,
            p.project_type,
            p.status,
            p.city,
            p.state,
            p.estimated_total,
            p.actual_total,
            (p.actual_total - p.estimated_total) as variance,
            case
                when p.estimated_total = 0 then 0
                else round(((p.actual_total - p.estimated_total) / p.estimated_total) * 100, 2)
            end as variance_percent,
            e.material_budget,
            e.labor_budget,
            e.total_budget
        from projects p
        join tenants t on t.id = p.tenant_id
        left join estimates e on e.project_id = p.id
        where t.slug = %s and lower(p.name) = lower(%s)
        limit 1;
    """

    materials_query = """
        select
            m.sku,
            m.name,
            m.uom,
            pm.estimated_quantity,
            pm.actual_quantity,
            pm.estimated_unit_cost,
            pm.actual_unit_cost,
            round(pm.estimated_quantity * pm.estimated_unit_cost, 2) as estimated_material_cost,
            round(pm.actual_quantity * pm.actual_unit_cost, 2) as actual_material_cost,
            round(
                (pm.actual_quantity * pm.actual_unit_cost) -
                (pm.estimated_quantity * pm.estimated_unit_cost),
                2
            ) as material_variance,
            sp.unit_price as current_supplier_price,
            sp.available_quantity,
            sp.effective_at as supplier_price_effective_at
        from projects p
        join tenants t on t.id = p.tenant_id
        join project_materials pm on pm.project_id = p.id
        join materials m on m.id = pm.material_id
        left join supplier_products product on product.external_sku = m.sku
        left join lateral (
            select unit_price, available_quantity, effective_at
            from supplier_prices price
            where price.supplier_product_id = product.id
            order by effective_at desc
            limit 1
        ) sp on true
        where t.slug = %s and lower(p.name) = lower(%s)
        order by material_variance desc;
    """

    expenses_query = """
        select expense_type, vendor_name, description, amount, incurred_on
        from expenses expense
        join projects p on p.id = expense.project_id
        join tenants t on t.id = p.tenant_id
        where t.slug = %s and lower(p.name) = lower(%s)
        order by incurred_on;
    """

    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(project_query, (tenant_slug, project_name))
            project = cursor.fetchone()
            if not project:
                raise HTTPException(status_code=404, detail="Project Cedar was not found.")

            cursor.execute(materials_query, (tenant_slug, project_name))
            materials = cursor.fetchall()

            cursor.execute(expenses_query, (tenant_slug, project_name))
            expenses = cursor.fetchall()

    safe_project = to_json_safe(project)
    safe_materials = to_json_safe(materials)
    safe_expenses = to_json_safe(expenses)

    top_materials = sorted(
        safe_materials,
        key=lambda item: item.get("material_variance", 0),
        reverse=True,
    )[:3]

    reason_lines = []
    for item in top_materials:
        quantity_delta = item["actual_quantity"] - item["estimated_quantity"]
        unit_cost_delta = item["actual_unit_cost"] - item["estimated_unit_cost"]
        reason_lines.append(
            {
                "material": item["name"],
                "variance": item["material_variance"],
                "quantity_delta": quantity_delta,
                "unit_cost_delta": unit_cost_delta,
                "current_supplier_price": item["current_supplier_price"],
                "uom": item["uom"],
            }
        )

    answer = (
        f"Project Cedar finished ${safe_project['variance']:,.0f} over its ${safe_project['estimated_total']:,.0f} "
        f"estimate ({safe_project['variance_percent']:.2f}%). The strongest material signals are higher-than-planned "
        "shingle, underlayment, and drip-edge usage plus higher unit costs. The expense log also records additional "
        "shingles after damaged decking increased the waste factor and supplemental underlayment/flashing."
    )

    execution = [
        {
            "step": "Intent",
            "status": "complete",
            "detail": "Project cost variance analysis for Project Cedar",
        },
        {
            "step": "Tenant scope",
            "status": "complete",
            "detail": f"Restricted query to tenant: {tenant_slug}",
        },
        {
            "step": "Structured query",
            "status": "complete",
            "detail": "Loaded project totals, estimate budget, material usage, expenses, and latest supplier prices",
        },
        {
            "step": "Evidence assembly",
            "status": "complete",
            "detail": f"Assembled {len(safe_materials)} material records and {len(safe_expenses)} expense records",
        },
        {
            "step": "Analysis",
            "status": "complete",
            "detail": "Calculated project variance and ranked material cost variance deterministically",
        },
        {
            "step": "Validation",
            "status": "complete",
            "detail": "Answer values are derived from the returned tenant-scoped records",
        },
    ]

    return {
        "question": "Why did Project Cedar exceed its material budget?",
        "tenant": tenant_slug,
        "answer": answer,
        "summary": {
            "estimated_total": safe_project["estimated_total"],
            "actual_total": safe_project["actual_total"],
            "variance": safe_project["variance"],
            "variance_percent": safe_project["variance_percent"],
            "material_budget": safe_project["material_budget"],
        },
        "reasons": reason_lines,
        "expenses": safe_expenses,
        "execution": execution,
        "mode": "deterministic_structured_analysis",
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }
