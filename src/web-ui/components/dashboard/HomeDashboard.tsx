import type { Project } from "../../interfaces/project";
import { money } from "../../utils/currency";
import ProjectTable from "../projects/ProjectTable";

interface HomeDashboardProps {
  projects: Project[];
  onOpenProject: (project: Project) => void;
  onInvestigate: (project: Project) => void;
}

export default function HomeDashboard({ projects, onOpenProject, onInvestigate }: HomeDashboardProps) {
  const activeProjects = projects.filter((project) => ["active", "in progress"].includes(project.status.toLowerCase()));
  const atRisk = projects.filter((project) => project.risk === "At risk");
  const watch = projects.filter((project) => project.risk === "Watch");
  const attention = [...atRisk, ...watch].slice(0, 3);
  const today = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(new Date());

  return (
    <div className="pageStack">
      <section className="pageIntro">
        <div>
          <p className="pageEyebrow">{today}</p>
          <h2>Project overview</h2>
          <p>Start with jobs that are outside plan, then move into the project details.</p>
        </div>
        <div className="summaryChip">{activeProjects.length} active projects</div>
      </section>

      <section className="attentionSection" aria-labelledby="attention-title">
        <div className="sectionHeadingRow">
          <div>
            <span className="sectionKicker">Needs attention</span>
            <h3 id="attention-title">{attention.length ? `${attention.length} ${attention.length === 1 ? "project needs" : "projects need"} review` : "No current cost exceptions"}</h3>
          </div>
          <span className="sectionMeta">From current project records</span>
        </div>

        {attention.length ? (
          <div className="attentionList">
            {attention.map((project) => (
              <article className={`attentionItem ${project.risk === "At risk" ? "attentionCritical" : "attentionWarning"}`} key={project.id}>
                <div className={`attentionSignal ${project.risk === "Watch" ? "warningSignal" : ""}`} aria-hidden="true">!</div>
                <div className="attentionContent">
                  <div className="attentionTitleRow">
                    <div>
                      <span className={`statusText ${project.risk === "At risk" ? "dangerText" : "warningText"}`}>{project.risk === "At risk" ? "Cost risk" : "Watch"}</span>
                      <h4>{project.name}</h4>
                    </div>
                    <span className="timeMeta">{project.status}</span>
                  </div>
                  <p>{project.variance >= 0 ? `${money(project.variance)} above the current estimate.` : `${money(Math.abs(project.variance))} below the current estimate.`}</p>
                  <div className="attentionFacts">
                    <span><b>{project.variancePercent.toFixed(1)}%</b> variance</span>
                    <span><b>{project.customer}</b> customer</span>
                  </div>
                  <div className="actionRow">
                    <button className="primaryButton" type="button" onClick={() => onInvestigate(project)}>Review issue</button>
                    <button className="secondaryButton" type="button" onClick={() => onOpenProject(project)}>Open project</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="polishedEmpty">
            <p>All active projects are currently within the cost thresholds calculated from recorded project data.</p>
          </div>
        )}
      </section>

      <section className="healthOverview" aria-label="Project health summary">
        <div><span>Active</span><strong>{activeProjects.length}</strong></div>
        <div><span>At risk</span><strong>{atRisk.length}</strong></div>
        <div><span>Watching</span><strong>{watch.length}</strong></div>
        <div><span>Estimated value</span><strong>{money(projects.reduce((sum, project) => sum + project.estimate, 0))}</strong></div>
      </section>

      <section className="contentSection">
        <div className="sectionHeadingRow">
          <div>
            <span className="sectionKicker">Your projects</span>
            <h3>Current work</h3>
          </div>
        </div>
        <ProjectTable projects={projects} onOpen={onOpenProject} />
      </section>
    </div>
  );
}
