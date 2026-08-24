import os
from datetime import date, datetime
from decimal import Decimal

import psycopg
from psycopg.rows import dict_row
from pymongo import MongoClient, ReplaceOne

DATABASE_NAME = os.getenv("MONGODB_DATABASE", "tracelayer_ai")
COLLECTION_NAME = "project_documents"

PROJECT_DOCUMENT_QUERY = r"""
with material_data as (
  select
    pm.project_id,
    jsonb_agg(
      jsonb_build_object(
        'sku', m.sku,
        'name', m.name,
        'category', m.category,
        'uom', m.uom,
        'estimated_quantity', pm.estimated_quantity,
        'actual_quantity', pm.actual_quantity,
        'estimated_unit_cost', pm.estimated_unit_cost,
        'actual_unit_cost', pm.actual_unit_cost
      ) order by m.name
    ) as materials,
    string_agg(
      m.name || ' estimated ' || pm.estimated_quantity || ' ' || m.uom || ' at $' || pm.estimated_unit_cost ||
      ', actual ' || pm.actual_quantity || ' ' || m.uom || ' at $' || pm.actual_unit_cost,
      '; ' order by m.name
    ) as material_text
  from project_materials pm
  join materials m on m.id = pm.material_id
  group by pm.project_id
), expense_data as (
  select
    e.project_id,
    jsonb_agg(
      jsonb_build_object(
        'expense_type', e.expense_type,
        'vendor_name', e.vendor_name,
        'description', e.description,
        'amount', e.amount,
        'incurred_on', e.incurred_on
      ) order by e.incurred_on
    ) as expenses,
    string_agg(coalesce(e.description, '') || ' $' || e.amount, '; ' order by e.incurred_on) as expense_text
  from expenses e
  group by e.project_id
), invoice_data as (
  select
    i.project_id,
    jsonb_agg(
      jsonb_build_object(
        'invoice_number', i.invoice_number,
        'status', i.status,
        'amount', i.amount,
        'due_on', i.due_on,
        'paid_on', i.paid_on
      ) order by i.due_on nulls last
    ) as invoices
  from invoices i
  group by i.project_id
)
select
  t.slug as tenant_id,
  'project_summary' as doc_type,
  p.id::text as project_id,
  p.name as project_name,
  jsonb_build_object(
    'name', p.name,
    'project_type', p.project_type,
    'status', p.status,
    'city', p.city,
    'state', p.state,
    'estimated_total', p.estimated_total,
    'actual_total', p.actual_total
  ) as project,
  jsonb_build_object('name', c.name) as customer,
  jsonb_build_object(
    'material_budget', est.material_budget,
    'labor_budget', est.labor_budget,
    'total_budget', est.total_budget,
    'estimated_total', p.estimated_total,
    'actual_total', p.actual_total,
    'variance', p.actual_total - p.estimated_total
  ) as financials,
  coalesce(md.materials, '[]'::jsonb) as materials,
  coalesce(ed.expenses, '[]'::jsonb) as expenses,
  coalesce(inv.invoices, '[]'::jsonb) as invoices,
  concat_ws(' ',
    p.name || ' is a ' || p.project_type || ' project in ' || p.city || ', ' || p.state || '.',
    'Status: ' || p.status || '.',
    'Estimated total $' || p.estimated_total || ', actual total $' || p.actual_total || '.',
    case when est.material_budget is not null then 'Material budget $' || est.material_budget || '.' end,
    md.material_text,
    ed.expense_text
  ) as search_text
from projects p
join tenants t on t.id = p.tenant_id
left join customers c on c.id = p.customer_id
left join estimates est on est.project_id = p.id
left join material_data md on md.project_id = p.id
left join expense_data ed on ed.project_id = p.id
left join invoice_data inv on inv.project_id = p.id
order by t.slug, p.name;
"""


def _json_safe(value):
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    if isinstance(value, list):
        return [_json_safe(item) for item in value]
    if isinstance(value, dict):
        return {key: _json_safe(item) for key, item in value.items()}
    return value


def build_document(row):
    document = _json_safe(dict(row))
    document["_id"] = document["project_id"]
    document["schema_version"] = 1
    document["source_refs"] = [
        f"tenants:{document['tenant_id']}",
        f"projects:{document['project_id']}",
        "estimates:project",
        "project_materials:project",
        "expenses:project",
        "invoices:project",
    ]
    document["metadata"] = {
        "synthetic": True,
        "source": "neon_postgresql",
        "synced_at": datetime.utcnow().isoformat() + "Z",
    }
    return document


def main():
    database_url = os.getenv("DATABASE_URL")
    mongodb_uri = os.getenv("MONGODB_URI")

    if not database_url:
        raise RuntimeError("DATABASE_URL is required")
    if not mongodb_uri:
        raise RuntimeError("MONGODB_URI is required")

    with psycopg.connect(database_url, row_factory=dict_row) as connection:
        with connection.cursor() as cursor:
            cursor.execute(PROJECT_DOCUMENT_QUERY)
            rows = cursor.fetchall()

    documents = [build_document(row) for row in rows]
    if not documents:
        print("No project documents found; nothing to sync.")
        return

    client = MongoClient(mongodb_uri, serverSelectionTimeoutMS=5000)
    collection = client[DATABASE_NAME][COLLECTION_NAME]

    operations = [
        ReplaceOne({"_id": document["_id"]}, document, upsert=True)
        for document in documents
    ]
    result = collection.bulk_write(operations, ordered=False)

    print(
        f"Synced {len(documents)} project documents "
        f"(upserted={result.upserted_count}, modified={result.modified_count}, matched={result.matched_count})."
    )


if __name__ == "__main__":
    main()
