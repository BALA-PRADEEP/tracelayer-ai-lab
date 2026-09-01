export type ProjectRisk = "Healthy" | "Watch" | "At risk";

export interface Project {
  id: string;
  name: string;
  customer: string;
  projectType: string;
  status: string;
  city: string | null;
  state: string | null;
  startedOn: string | null;
  completedOn: string | null;
  estimate: number;
  actual: number;
  variance: number;
  variancePercent: number;
  risk: ProjectRisk;
}

export interface ProjectMaterial {
  sku: string;
  name: string;
  category: string | null;
  uom: string;
  estimated_quantity: number;
  actual_quantity: number;
  estimated_unit_cost: number;
  actual_unit_cost: number;
  estimated_material_cost: number;
  actual_material_cost: number;
}

export interface ProjectExpense {
  expense_type: string;
  vendor_name: string | null;
  description: string | null;
  amount: number;
  incurred_on: string;
}

export interface ProjectInvoice {
  invoice_number: string;
  status: string;
  amount: number;
  due_on: string | null;
  paid_on: string | null;
}

export interface ProjectDetail {
  project: Project;
  materialBudget: number;
  laborBudget: number;
  totalBudget: number;
  materials: ProjectMaterial[];
  expenses: ProjectExpense[];
  invoices: ProjectInvoice[];
}

export interface SupplierOption {
  provider: string;
  sku: string;
  name: string;
  uom: string;
  unit_price: number;
  available_quantity: number | null;
  effective_at: string;
}
