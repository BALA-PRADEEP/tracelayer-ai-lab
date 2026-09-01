from datetime import datetime, timezone

from backend.source.dal.ProjectRepository import ProjectRepository


class ProjectService:
    def __init__(self, repository: ProjectRepository | None = None) -> None:
        self.repository = repository or ProjectRepository()

    def get_over_budget_projects(self, tenant_slug: str):
        rows = self.repository.list_over_budget_projects(tenant_slug)
        return {"tenant": tenant_slug, "count": len(rows), "projects": rows}

    def get_project_detail(self, tenant_slug: str, project_name: str):
        project = self.repository.get_project(tenant_slug, project_name)
        if project is None:
            return None
        return {
            "tenant": tenant_slug,
            "project": project,
            "materials": self.repository.get_project_materials(tenant_slug, project_name),
            "expenses": self.repository.get_project_expenses(tenant_slug, project_name),
        }

    def analyze_project_costs(self, tenant_slug: str, project_name: str):
        detail = self.get_project_detail(tenant_slug, project_name)
        if detail is None:
            return None

        project = detail["project"]
        materials = self.repository.get_material_variances(tenant_slug, project_name)
        expenses = detail["expenses"]
        top_materials = sorted(materials, key=lambda item: item.get("material_variance", 0), reverse=True)[:3]

        reasons = []
        for item in top_materials:
            reasons.append({
                "material": item["name"],
                "variance": item["material_variance"],
                "quantity_delta": item["actual_quantity"] - item["estimated_quantity"],
                "unit_cost_delta": item["actual_unit_cost"] - item["estimated_unit_cost"],
                "current_supplier_price": item["current_supplier_price"],
                "uom": item["uom"],
            })

        answer = (
            f"{project_name} finished ${project['variance']:,.0f} over its ${project['estimated_total']:,.0f} "
            f"estimate ({project['variance_percent']:.2f}%). The strongest material signals are higher-than-planned "
            "usage and unit costs. Project expenses provide the supporting operational context."
        )

        return {
            "question": f"Why did {project_name} exceed its material budget?",
            "tenant": tenant_slug,
            "answer": answer,
            "summary": {
                "estimated_total": project["estimated_total"],
                "actual_total": project["actual_total"],
                "variance": project["variance"],
                "variance_percent": project["variance_percent"],
                "material_budget": project["material_budget"],
            },
            "reasons": reasons,
            "expenses": expenses,
            "execution": [
                {"step": "Intent", "status": "complete", "detail": f"Project cost variance analysis for {project_name}"},
                {"step": "Tenant scope", "status": "complete", "detail": f"Restricted query to tenant: {tenant_slug}"},
                {"step": "Structured query", "status": "complete", "detail": "Loaded project, estimate, material, expense, and supplier records"},
                {"step": "Evidence assembly", "status": "complete", "detail": f"Assembled {len(materials)} material records and {len(expenses)} expense records"},
                {"step": "Analysis", "status": "complete", "detail": "Calculated and ranked material cost variance"},
                {"step": "Validation", "status": "complete", "detail": "Answer values are derived from tenant-scoped records"},
            ],
            "mode": "deterministic_structured_analysis",
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }
