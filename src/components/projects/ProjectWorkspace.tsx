import { PROJECT_TABS } from "../../constants/navigation";
import type { Project } from "../../interfaces/project";
import { money } from "../../utils/currency";

interface ProjectWorkspaceProps {
  project: Project;
  onInvestigate: () => void;
}

export default function ProjectWorkspace({ project, onInvestigate }: ProjectWorkspaceProps) {
  return (
    <section className="projectWorkspace">
      <div className="projectTitleRow">
        <div>
          <span className="sectionLabel">{project.customer}</span>
          <h2>{project.name}</h2>
          <p className="subcopy">Everything needed to understand and run this project in one place.</p>
        </div>
        <button className="primaryButton" type="button" onClick={onInvestigate}>Investigate project</button>
      </div>

      <div className="projectTabs">
        {PROJECT_TABS.map((tab, index) => (
          <button type="button" className={index === 0 ? "projectTab projectTabActive" : "projectTab"} key={tab}>{tab}</button>
        ))}
      </div>

      <div className="projectSummaryGrid">
        <article><span>Project status</span><strong>{project.status}</strong></article>
        <article><span>Estimate</span><strong>{money(project.estimate)}</strong></article>
        <article><span>Actual cost</span><strong>{project.actual ? money(project.actual) : "Not started"}</strong></article>
        <article><span>Margin</span><strong>{project.margin}%</strong></article>
      </div>

      <div className="projectColumns">
        <section className="detailCard">
          <div className="sectionHeader"><div><span className="sectionLabel">Cost performance</span><h3>Estimate vs actual</h3></div></div>
          <div className="costBars">
            <div><span>Materials</span><strong>$42,000</strong><em>$51,700 actual</em></div>
            <div><span>Labour</span><strong>$21,500</strong><em>$20,900 actual</em></div>
            <div><span>Equipment</span><strong>$6,400</strong><em>$6,150 actual</em></div>
          </div>
        </section>
        <section className="detailCard">
          <div className="sectionHeader"><div><span className="sectionLabel">Next actions</span><h3>Keep the job moving</h3></div></div>
          <div className="actionList">
            <button type="button">Review material variance <span>→</span></button>
            <button type="button">Compare supplier pricing <span>→</span></button>
            <button type="button">Review open purchase orders <span>→</span></button>
            <button type="button">Check project notes <span>→</span></button>
          </div>
        </section>
      </div>
    </section>
  );
}
