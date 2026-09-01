import type { Project } from "../../interfaces/project";
import { money } from "../../utils/currency";
import ProjectTable from "../projects/ProjectTable";

interface HomeDashboardProps {
  projects: Project[];
  onOpenProject: (project: Project) => void;
  onInvestigate: (project: Project) => void;
}

export default function HomeDashboard({ projects, onOpenProject, onInvestigate }: HomeDashboardProps) {
  const activeProjects = projects.filter((project) => project.status === "In progress");
  const atRisk = projects.filter((project) => project.risk === "At risk");
  const watch = projects.filter((project) => project.risk === "Watch");
  const cedar = projects[0];

  return (
    <div className="pageStack">
      <section className="pageIntro">
        <div>
          <p className="pageEyebrow">Tuesday, September 1</p>
          <h2>Good afternoon</h2>
          <p>Start with the work that needs attention, then move into the project details.</p>
        </div>
        <div className="summaryChip">{activeProjects.length} active projects</div>
      </section>

      <section className="attentionSection" aria-labelledby="attention-title">
        <div className="sectionHeadingRow">
          <div>
            <span className="sectionKicker">Needs attention</span>
            <h3 id="attention-title">Two items need a decision</h3>
          </div>
          <span className="sectionMeta">Updated moments ago</span>
        </div>

        <div className="attentionList">
          <article className="attentionItem attentionCritical">
            <div className="attentionSignal" aria-hidden="true">!</div>
            <div className="attentionContent">
              <div className="attentionTitleRow">
                <div>
                  <span className="statusText dangerText">Cost risk</span>
                  <h4>{cedar.name}</h4>
                </div>
                <span className="timeMeta">2h ago</span>
              </div>
              <p>Material cost is {money(cedar.actual - cedar.estimate)} above plan. Shingles account for most of the increase.</p>
              <div className="attentionFacts">
                <span><b>{money(cedar.actual - cedar.estimate)}</b> variance</span>
                <span><b>{cedar.margin}%</b> current margin</span>
              </div>
              <div className="actionRow">
                <button className="primaryButton" type="button" onClick={() => onInvestigate(cedar)}>Review issue</button>
                <button className="secondaryButton" type="button" onClick={() => onOpenProject(cedar)}>Open project</button>
              </div>
            </div>
          </article>

          <article className="attentionItem attentionWarning">
            <div className="attentionSignal warningSignal" aria-hidden="true">!</div>
            <div className="attentionContent">
              <div className="attentionTitleRow">
                <div>
                  <span className="statusText warningText">Delivery risk</span>
                  <h4>PO #1048 · Project Atlas</h4>
                </div>
                <span className="timeMeta">Today</span>
              </div>
              <p>The expected delivery is two days after the scheduled installation date.</p>
              <div className="actionRow">
                <button className="secondaryButton" type="button">Review purchase order</button>
              </div>
            </div>
          </article>
        </div>
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
          <button className="textButton" type="button">View all projects</button>
        </div>
        <ProjectTable projects={projects} onOpen={onOpenProject} />
      </section>
    </div>
  );
}
