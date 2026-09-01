"use client";

import { useState } from "react";
import type { Project } from "../../interfaces/project";
import { money } from "../../utils/currency";

interface ProjectWorkspaceProps {
  project: Project;
  onBack: () => void;
  onInvestigate: () => void;
}

const tabs = ["Overview", "Costs", "Materials", "Purchases", "Schedule", "Documents"] as const;

export default function ProjectWorkspace({ project, onBack, onInvestigate }: ProjectWorkspaceProps) {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Overview");
  const variance = project.actual ? project.actual - project.estimate : 0;

  return (
    <div className="pageStack projectPage">
      <button className="backButton" type="button" onClick={onBack}>← All projects</button>

      <section className="projectHero">
        <div>
          <div className="projectMetaLine">
            <span>{project.customer}</span>
            <span>•</span>
            <span>Roofing</span>
            <span>•</span>
            <span>125 Cedar Ave, Austin TX</span>
          </div>
          <div className="projectNameRow">
            <h2>{project.name}</h2>
            <span className={`healthTag ${project.risk === "At risk" ? "danger" : project.risk === "Watch" ? "warning" : "success"}`}>{project.risk}</span>
          </div>
          <div className="projectProgressLine"><span>68% complete</span><span>Updated 25 min ago</span></div>
        </div>
        <div className="actionRow">
          <button className="secondaryButton" type="button">•••</button>
          <button className="primaryButton" type="button" onClick={onInvestigate}>Ask BuildPilot</button>
        </div>
      </section>

      <div className="projectTabs" role="tablist" aria-label="Project sections">
        {tabs.map((item) => (
          <button key={item} type="button" role="tab" aria-selected={tab === item} className={tab === item ? "projectTab projectTabActive" : "projectTab"} onClick={() => setTab(item)}>{item}</button>
        ))}
      </div>

      {tab === "Overview" && (
        <>
          {project.risk === "At risk" && (
            <section className="riskBanner">
              <div className="riskIcon">!</div>
              <div className="riskBannerContent">
                <span className="statusText dangerText">Margin risk</span>
                <h3>Material spend is {money(Math.abs(variance))} above plan.</h3>
                <p>Shingle quantity and unit cost are the largest drivers of the current variance.</p>
              </div>
              <div className="riskBannerActions">
                <button className="primaryButton" type="button" onClick={onInvestigate}>Investigate</button>
                <button className="secondaryButton" type="button" onClick={() => setTab("Costs")}>View cost breakdown</button>
              </div>
            </section>
          )}

          <section className="projectHealthGrid" aria-label="Project health">
            <article><span>Budget</span><strong className={variance > 0 ? "dangerText" : "successText"}>{variance > 0 ? `+${money(variance)}` : money(variance)}</strong><small>{variance > 0 ? "11.8% over plan" : "Within plan"}</small></article>
            <article><span>Schedule</span><strong>On schedule</strong><small>68% completed</small></article>
            <article><span>Purchasing</span><strong>1 delayed PO</strong><small className="warningText">Action required</small></article>
          </section>

          <section className="projectColumns">
            <article className="contentSection">
              <div className="sectionHeadingRow"><div><span className="sectionKicker">Cost performance</span><h3>Estimate vs actual</h3></div><button className="textButton" type="button" onClick={() => setTab("Costs")}>View costs</button></div>
              <div className="costTable">
                <div className="costHeader"><span>Category</span><span>Planned</span><span>Actual</span><span>Variance</span></div>
                <div><span>Materials</span><span>$42,000</span><span>$51,700</span><strong className="dangerText">+$9,700</strong></div>
                <div><span>Labor</span><span>$21,500</span><span>$20,900</span><strong className="successText">-$600</strong></div>
                <div><span>Equipment</span><span>$6,400</span><span>$6,150</span><strong className="successText">-$250</strong></div>
              </div>
            </article>

            <article className="contentSection">
              <div className="sectionHeadingRow"><div><span className="sectionKicker">Upcoming</span><h3>Next milestones</h3></div></div>
              <div className="timelineList">
                <div><span>Tomorrow</span><strong>Roofing installation</strong></div>
                <div><span>Sep 04</span><strong>ABC Supply delivery</strong></div>
                <div><span>Sep 06</span><strong>Customer inspection</strong></div>
              </div>
            </article>
          </section>
        </>
      )}

      {tab !== "Overview" && (
        <section className="contentSection moduleState">
          <div className="moduleStateIcon">{tab === "Costs" ? "$" : tab === "Materials" ? "▦" : tab === "Purchases" ? "⇄" : tab === "Schedule" ? "◷" : "□"}</div>
          <span className="sectionKicker">{tab}</span>
          <h3>{tab} workspace</h3>
          <p>This section will use the same project context and interaction patterns. The next implementation will connect it to the Python service layer.</p>
          {tab === "Costs" && <button className="primaryButton" type="button" onClick={onInvestigate}>Explain current variance</button>}
        </section>
      )}
    </div>
  );
}
