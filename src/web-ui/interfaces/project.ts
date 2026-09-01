export type ProjectRisk = "Healthy" | "Watch" | "At risk";

export interface Project {
  name: string;
  customer: string;
  status: string;
  estimate: number;
  actual: number;
  margin: number;
  risk: ProjectRisk;
}
