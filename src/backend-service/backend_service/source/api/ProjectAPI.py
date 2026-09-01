from fastapi import APIRouter, HTTPException

from backend_service.source.service.ProjectService import ProjectService

PROJECT_API = APIRouter(prefix="/api/demo", tags=["Projects"])


def _service() -> ProjectService:
    return ProjectService()


@PROJECT_API.get("/over-budget")
def over_budget_projects(tenant_slug: str = "stark-roofing"):
    return _service().get_over_budget_projects(tenant_slug)


@PROJECT_API.get("/projects/{project_name}")
def project_detail(project_name: str, tenant_slug: str = "stark-roofing"):
    project = _service().get_project_detail(tenant_slug, project_name)
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found.")
    return project


@PROJECT_API.get("/cedar-analysis")
def cedar_analysis(tenant_slug: str = "stark-roofing"):
    result = _service().analyze_project_costs(tenant_slug, "Project Cedar")
    if result is None:
        raise HTTPException(status_code=404, detail="Project Cedar was not found.")
    return result
