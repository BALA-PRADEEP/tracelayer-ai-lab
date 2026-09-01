import type { Project } from "../../interfaces/project";
import { money } from "../../utils/currency";

interface ProjectTableProps {
  projects: Project[];
  onOpen: (project: Project) => void;
}

export default function ProjectTable({ projects, onOpen }: ProjectTableProps) {
  return (
    <div className="projectTable" role="table">
      <div className="projectRow projectHeader" role="row">
        <span>Project</span><span>Customer</span><span>Status</span><span>Estimate</span><span>Actual</span><span>Variance</span><span>Health</span>
      </div>
      {projects.map((project) => (
        <button className="projectRow projectButton" key={project.id} type="button" onClick={() => onOpen(project)}>
          <strong>{project.name}</strong>
          <span>{project.customer}</span>
          <span>{project.status}</span>
          <span>{money(project.estimate)}</span>
          <span>{project.actual ? money(project.actual) : "—"}</span>
          <span className={project.variance > 0 ? "dangerText" : project.variance < 0 ? "successText" : ""}>{project.variance > 0 ? `+${money(project.variance)}` : money(project.variance)}</span>
          <span className={`healthTag ${project.risk === "At risk" ? "danger" : project.risk === "Watch" ? "warning" : "success"}`}>{project.risk}</span>
        </button>
      ))}
    </div>
  );
}
