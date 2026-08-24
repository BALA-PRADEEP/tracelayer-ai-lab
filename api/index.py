import os
from datetime import datetime, timezone
from decimal import Decimal

import psycopg
from fastapi import FastAPI, HTTPException
from psycopg.rows import dict_row

app = FastAPI(
    title="TraceLayer API",
    version="0.2.0",
    description="Backend foundation for the TraceLayer Production AI Engineering Lab.",
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
        "service": "tracelayer-api",
        "message": "TraceLayer API is online.",
    }


@app.get("/api/health")
def health() -> dict[str, str]:
    return {
        "status": "ok",
        "service": "tracelayer-api",
        "version": "0.2.0",
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
