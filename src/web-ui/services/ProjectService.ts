import { apiGet } from "./ApiBase";
import type { Project, ProjectDetail, SupplierOption } from "../interfaces/project";

interface ProjectApiRow {
  id: string;
  name: string;
  customer: string | null;
  project_type: string;
  status: string;
  city: string | null;
  state: string | null;
  started_on: string | null;
  completed_on: string | null;
  estimated_total: number;
  actual_total: number;
  variance: number;
  variance_percent: number;
  risk: Project["risk"];
}

interface ProjectListResponse {
  projects: ProjectApiRow[];
}

interface ProjectDetailResponse {
  project: ProjectApiRow & {
    material_budget?: number;
    labor_budget?: number;
    total_budget?: number;
  };
  materials: ProjectDetail["materials"];
  expenses: ProjectDetail["expenses"];
  invoices: ProjectDetail["invoices"];
}

export interface ProjectAnalysisResponse {
  question: string;
  answer: string;
  summary: {
    estimated_total: number;
    actual_total: number;
    variance: number;
    variance_percent: number;
    material_budget: number;
    material_actual: number;
    material_variance: number;
  };
  reasons: Array<{
    sku: string;
    material: string;
    variance: number;
    quantity_delta: number;
    unit_cost_delta: number;
    uom: string;
  }>;
  execution: Array<{ step: string; status: string }>;
}

function mapProject(row: ProjectApiRow): Project {
  return {
    id: row.id,
    name: row.name,
    customer: row.customer ?? "Customer not assigned",
    projectType: row.project_type,
    status: row.status,
    city: row.city,
    state: row.state,
    startedOn: row.started_on,
    completedOn: row.completed_on,
    estimate: Number(row.estimated_total),
    actual: Number(row.actual_total),
    variance: Number(row.variance),
    variancePercent: Number(row.variance_percent),
    risk: row.risk,
  };
}

export async function getProjects(): Promise<Project[]> {
  const response = await apiGet<ProjectListResponse>("/api/demo/projects");
  return response.projects.map(mapProject);
}

export async function getProjectDetail(projectName: string): Promise<ProjectDetail> {
  const response = await apiGet<ProjectDetailResponse>(`/api/demo/projects/${encodeURIComponent(projectName)}`);
  return {
    project: mapProject(response.project),
    materialBudget: Number(response.project.material_budget ?? 0),
    laborBudget: Number(response.project.labor_budget ?? 0),
    totalBudget: Number(response.project.total_budget ?? response.project.estimated_total),
    materials: response.materials,
    expenses: response.expenses,
    invoices: response.invoices,
  };
}

export const getProjectAnalysis = (projectName: string) =>
  apiGet<ProjectAnalysisResponse>(`/api/demo/projects/${encodeURIComponent(projectName)}/analysis`);

export async function getSupplierOptions(sku: string): Promise<SupplierOption[]> {
  const response = await apiGet<{ suppliers: SupplierOption[] }>(`/api/demo/suppliers/${encodeURIComponent(sku)}`);
  return response.suppliers;
}
