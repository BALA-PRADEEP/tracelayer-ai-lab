import type { Project } from "../interfaces/project";

export const projects: Project[] = [
  { name: "Project Cedar", customer: "Stark Roofing", status: "In progress", estimate: 82000, actual: 91700, margin: 14, risk: "At risk" },
  { name: "Project Atlas", customer: "Summit Construction", status: "In progress", estimate: 120000, actual: 118400, margin: 22, risk: "Healthy" },
  { name: "Project Falcon", customer: "Acme Homes", status: "Planning", estimate: 64000, actual: 0, margin: 27, risk: "Watch" },
  { name: "Project Summit", customer: "Northfield Builders", status: "In progress", estimate: 97000, actual: 88400, margin: 24, risk: "Healthy" },
];
