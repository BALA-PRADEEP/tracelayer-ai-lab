import { apiGet } from "./ApiBase";

export interface ProjectAnalysisResponse {
  question: string;
  answer: string;
  summary: {
    estimated_total: number;
    actual_total: number;
    variance: number;
    variance_percent: number;
    material_budget: number;
  };
}

export const getProjectAnalysis = () =>
  apiGet<ProjectAnalysisResponse>("/api/demo/cedar-analysis");
