from backend_service.source.dal.base_dao import with_retry
from backend_service.source.dal.db_session import database_session
from backend_service.source.Utils.serialization import to_json_safe


class ProjectRepository:
    @with_retry
    def list_over_budget_projects(self, tenant_slug: str):
        query = """
            select p.id, p.name, p.project_type, p.status, p.city, p.state,
                   p.estimated_total, p.actual_total,
                   (p.actual_total - p.estimated_total) as variance,
                   case when p.estimated_total = 0 then 0
                        else round(((p.actual_total - p.estimated_total) / p.estimated_total) * 100, 2)
                   end as variance_percent
            from projects p
            join tenants t on t.id = p.tenant_id
            where t.slug = %s and p.actual_total > p.estimated_total
            order by variance desc
        """
        return self._fetch_all(query, (tenant_slug,))

    @with_retry
    def get_project(self, tenant_slug: str, project_name: str):
        query = """
            select p.id, p.name, p.project_type, p.status, p.city, p.state,
                   p.estimated_total, p.actual_total,
                   (p.actual_total - p.estimated_total) as variance,
                   case when p.estimated_total = 0 then 0
                        else round(((p.actual_total - p.estimated_total) / p.estimated_total) * 100, 2)
                   end as variance_percent,
                   e.material_budget, e.labor_budget, e.total_budget
            from projects p
            join tenants t on t.id = p.tenant_id
            left join estimates e on e.project_id = p.id
            where t.slug = %s and lower(p.name) = lower(%s)
            limit 1
        """
        return self._fetch_one(query, (tenant_slug, project_name))

    @with_retry
    def get_project_materials(self, tenant_slug: str, project_name: str):
        query = """
            select m.sku, m.name, m.category, m.uom,
                   pm.estimated_quantity, pm.actual_quantity,
                   pm.estimated_unit_cost, pm.actual_unit_cost,
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
                order by effective_at desc limit 1
            ) sp on true
            where t.slug = %s and lower(p.name) = lower(%s)
            order by m.name
        """
        return self._fetch_all(query, (tenant_slug, project_name))

    @with_retry
    def get_material_variances(self, tenant_slug: str, project_name: str):
        query = """
            select m.sku, m.name, m.uom,
                   pm.estimated_quantity, pm.actual_quantity,
                   pm.estimated_unit_cost, pm.actual_unit_cost,
                   round(pm.estimated_quantity * pm.estimated_unit_cost, 2) as estimated_material_cost,
                   round(pm.actual_quantity * pm.actual_unit_cost, 2) as actual_material_cost,
                   round((pm.actual_quantity * pm.actual_unit_cost) -
                         (pm.estimated_quantity * pm.estimated_unit_cost), 2) as material_variance,
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
                order by effective_at desc limit 1
            ) sp on true
            where t.slug = %s and lower(p.name) = lower(%s)
            order by material_variance desc
        """
        return self._fetch_all(query, (tenant_slug, project_name))

    @with_retry
    def get_project_expenses(self, tenant_slug: str, project_name: str):
        query = """
            select expense_type, vendor_name, description, amount, incurred_on
            from expenses expense
            join projects p on p.id = expense.project_id
            join tenants t on t.id = p.tenant_id
            where t.slug = %s and lower(p.name) = lower(%s)
            order by incurred_on
        """
        return self._fetch_all(query, (tenant_slug, project_name))

    def _fetch_one(self, query: str, params: tuple):
        with database_session() as connection:
            with connection.cursor() as cursor:
                cursor.execute(query, params)
                row = cursor.fetchone()
                return to_json_safe(row) if row else None

    def _fetch_all(self, query: str, params: tuple):
        with database_session() as connection:
            with connection.cursor() as cursor:
                cursor.execute(query, params)
                return to_json_safe(cursor.fetchall())
