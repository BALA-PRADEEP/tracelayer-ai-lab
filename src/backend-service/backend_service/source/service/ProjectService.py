from datetime import datetime, timezone

from backend_service.source.dal.ProjectRepository import ProjectRepository


class ProjectService:
    def __init__(self, repository: ProjectRepository | None = None) -> None:
        self.repository = repository or ProjectRepository()

    @staticmethod
    def _risk(variance_percent: float, status: str) -> str:
        if str(status).lower() not in {"active", "in progress"}:
            return "Healthy"
        if variance_percent >= 5:
            return "At risk"
        if variance_percent >= 0:
            return "Watch"
        return "Healthy"

    def list_projects(self, tenant_slug: str):
        rows = self.repository.list_projects(tenant_slug)
        projects = []
        for row in rows:
            item = dict(row)
            variance_percent = float(item.get("variance_percent") or 0)
            item["risk"] = self._risk(variance_percent, item.get("status", ""))
            projects.append(item)
        return {"tenant": tenant_slug, "count": len(projects), "projects": projects}

    def get_over_budget_projects(self, tenant_slug: str):
        rows = self.repository.list_over_budget_projects(tenant_slug)
        return {"tenant": tenant_slug, "count": len(rows), "projects": rows}

    def get_project_detail(self, tenant_slug: str, project_name: str):
        project = self.repository.get_project(tenant_slug, project_name)
        if project is None:
            return None
        project = dict(project)
        project["risk"] = self._risk(float(project.get("variance_percent") or 0), project.get("status", ""))
        return {
            "tenant": tenant_slug,
            "project": project,
            "materials": self.repository.get_project_materials(tenant_slug, project_name),
            "expenses": self.repository.get_project_expenses(tenant_slug, project_name),
            "invoices": self.repository.get_project_invoices(tenant_slug, project_name),
        }

    def analyze_project_costs(self, tenant_slug: str, project_name: str):
        detail = self.get_project_detail(tenant_slug, project_name)
        if detail is None:
            return None

        project = detail["project"]
        materials = self.repository.get_material_variances(tenant_slug, project_name)
        expenses = detail["expenses"]
        top_materials = sorted(materials, key=lambda item: float(item.get("material_variance") or 0), reverse=True)[:3]

        reasons = []
        for item in top_materials:
            reasons.append({
                "sku": item["sku"],
                "material": item["name"],
                "variance": item["material_variance"],
                "quantity_delta": item["actual_quantity"] - item["estimated_quantity"],
                "unit_cost_delta": item["actual_unit_cost"] - item["estimated_unit_cost"],
                "uom": item["uom"],
            })

        material_budget = float(project.get("material_budget") or 0)
        material_actual = sum(float(item.get("actual_material_cost") or 0) for item in materials)
        material_variance = material_actual - material_budget

        answer = (
            f"{project_name} is ${float(project['variance']):,.0f} against its ${float(project['estimated_total']):,.0f} "
            f"project estimate ({float(project['variance_percent']):.2f}%). Material records account for "
            f"${material_variance:,.0f} of variance against the material budget."
        )

        return {
            "question": f"Why is {project_name} over budget?",
            "tenant": tenant_slug,
            "answer": answer,
            "summary": {
                "estimated_total": project["estimated_total"],
                "actual_total": project["actual_total"],
                "variance": project["variance"],
                "variance_percent": project["variance_percent"],
                "material_budget": project.get("material_budget") or 0,
                "material_actual": material_actual,
                "material_variance": material_variance,
            },
            "reasons": reasons,
            "expenses": expenses,
            "execution": [
                {"step": "Project budget", "status": "complete"},
                {"step": "Material usage", "status": "complete"},
                {"step": "Project expenses", "status": "complete"},
                {"step": "Variance analysis", "status": "complete"},
            ],
            "mode": "database_backed_analysis",
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }

    def get_supplier_options(self, sku: str):
        options = self.repository.get_supplier_options(sku)
        return {"sku": sku, "count": len(options), "suppliers": options}
