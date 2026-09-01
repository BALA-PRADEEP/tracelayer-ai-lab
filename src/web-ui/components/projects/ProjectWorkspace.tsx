"use client";

import { useEffect, useMemo, useState } from "react";
import type { Project, ProjectDetail } from "../../interfaces/project";
import { getProjectDetail } from "../../services/ProjectService";
import { money } from "../../utils/currency";

interface ProjectWorkspaceProps {
  project: Project;
  onBack: () => void;
  onInvestigate: () => void;
}

const tabs = ["Overview", "Costs", "Materials", "Purchases", "Schedule", "Documents"] as const;

type ProjectTab = (typeof tabs)[number];

export default function ProjectWorkspace({ project, onBack, onInvestigate }: ProjectWorkspaceProps) {
  const [tab, setTab] = useState<ProjectTab>("Overview");
  const [detail, setDetail] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(false);
    getProjectDetail(project.name)
      .then((response) => mounted && setDetail(response))
      .catch(() => mounted && setError(true))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [project.name]);

  const materialActual = useMemo(() => detail?.materials.reduce((sum, item) => sum + Number(item.actual_material_cost || 0), 0) ?? 0, [detail]);
  const materialVariance = materialActual - (detail?.materialBudget ?? 0);

  if (loading) {
    return <section className="contentSection moduleState"><span className="sectionKicker">Project</span><h3>Loading project details…</h3><p>Getting the latest estimate, materials, expenses, and invoices.</p></section>;
  }

  if (error || !detail) {
    return <section className="contentSection moduleState" role="alert"><span className="sectionKicker">Project</span><h3>We couldn't load this project.</h3><p>Please return to the project list and try again.</p><button className="secondaryButton" type="button" onClick={onBack}>Back to projects</button></section>;
  }

  const current = detail.project;
  const location = [current.city, current.state].filter(Boolean).join(", ") || "Location not recorded";

  return (
    <div className="pageStack projectPage">
      <button className="backButton" type="button" onClick={onBack}>← All projects</button>

      <section className="projectHero">
        <div>
          <div className="projectMetaLine">
            <span>{current.customer}</span><span>•</span><span>{current.projectType}</span><span>•</span><span>{location}</span>
          </div>
          <div className="projectNameRow">
            <h2>{current.name}</h2>
            <span className={`healthTag ${current.risk === "At risk" ? "danger" : current.risk === "Watch" ? "warning" : "success"}`}>{current.risk}</span>
          </div>
          <div className="projectProgressLine"><span>{current.status}</span><span>{current.startedOn ? `Started ${current.startedOn}` : "Start date not recorded"}</span></div>
        </div>
        <div className="actionRow">
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
          {current.risk === "At risk" && (
            <section className="riskBanner">
              <div className="riskIcon">!</div>
              <div className="riskBannerContent">
                <span className="statusText dangerText">Cost risk</span>
                <h3>{money(Math.abs(current.variance))} {current.variance >= 0 ? "above" : "below"} the project estimate.</h3>
                <p>The recorded project costs are {Math.abs(current.variancePercent).toFixed(1)}% {current.variance >= 0 ? "over" : "under"} the current estimate.</p>
              </div>
              <div className="riskBannerActions">
                <button className="primaryButton" type="button" onClick={onInvestigate}>Investigate</button>
                <button className="secondaryButton" type="button" onClick={() => setTab("Costs")}>View cost breakdown</button>
              </div>
            </section>
          )}

          <section className="projectHealthGrid" aria-label="Project health">
            <article><span>Estimate</span><strong>{money(current.estimate)}</strong><small>Current project estimate</small></article>
            <article><span>Recorded cost</span><strong>{money(current.actual)}</strong><small>{current.variancePercent.toFixed(1)}% variance</small></article>
            <article><span>Material cost</span><strong>{money(materialActual)}</strong><small>{money(Math.abs(materialVariance))} {materialVariance >= 0 ? "over" : "under"} material budget</small></article>
          </section>

          <section className="projectColumns">
            <article className="contentSection">
              <div className="sectionHeadingRow"><div><span className="sectionKicker">Cost performance</span><h3>Estimate vs recorded cost</h3></div><button className="textButton" type="button" onClick={() => setTab("Costs")}>View costs</button></div>
              <div className="costTable">
                <div className="costHeader"><span>Category</span><span>Planned</span><span>Actual</span><span>Variance</span></div>
                <div><span>Materials</span><span>{money(detail.materialBudget)}</span><span>{money(materialActual)}</span><strong className={materialVariance > 0 ? "dangerText" : "successText"}>{materialVariance > 0 ? "+" : ""}{money(materialVariance)}</strong></div>
                <div><span>Whole project</span><span>{money(current.estimate)}</span><span>{money(current.actual)}</span><strong className={current.variance > 0 ? "dangerText" : "successText"}>{current.variance > 0 ? "+" : ""}{money(current.variance)}</strong></div>
              </div>
            </article>

            <article className="contentSection">
              <div className="sectionHeadingRow"><div><span className="sectionKicker">Financial records</span><h3>Invoices</h3></div></div>
              {detail.invoices.length ? <div className="timelineList">{detail.invoices.map((invoice) => <div key={invoice.invoice_number}><span>{invoice.status}</span><strong>{invoice.invoice_number} · {money(Number(invoice.amount))}</strong></div>)}</div> : <p className="subcopy">No invoices are recorded for this project.</p>}
            </article>
          </section>
        </>
      )}

      {tab === "Costs" && (
        <section className="contentSection">
          <div className="sectionHeadingRow"><div><span className="sectionKicker">Costs</span><h3>Recorded project expenses</h3></div></div>
          {detail.expenses.length ? <div className="timelineList">{detail.expenses.map((expense, index) => <div key={`${expense.incurred_on}-${index}`}><span>{expense.incurred_on}</span><strong>{expense.description || expense.expense_type} · {money(Number(expense.amount))}</strong></div>)}</div> : <p className="subcopy">No project expenses have been recorded.</p>}
        </section>
      )}

      {tab === "Materials" && (
        <section className="contentSection">
          <div className="sectionHeadingRow"><div><span className="sectionKicker">Materials</span><h3>Estimate vs usage</h3></div></div>
          {detail.materials.length ? <div className="costTable"><div className="costHeader"><span>Material</span><span>Planned</span><span>Actual</span><span>Actual cost</span></div>{detail.materials.map((item) => <div key={item.sku}><span>{item.name}</span><span>{item.estimated_quantity} {item.uom}</span><span>{item.actual_quantity} {item.uom}</span><strong>{money(Number(item.actual_material_cost))}</strong></div>)}</div> : <p className="subcopy">No materials are recorded for this project.</p>}
        </section>
      )}

      {tab === "Purchases" && (
        <section className="contentSection moduleState"><span className="sectionKicker">Purchases</span><h3>No purchase-order records are available yet.</h3><p>BuildPilot will show purchase orders here after the purchase-order table is added to the application database.</p></section>
      )}

      {tab === "Schedule" && (
        <section className="contentSection"><div className="sectionHeadingRow"><div><span className="sectionKicker">Schedule</span><h3>Recorded project dates</h3></div></div><div className="timelineList"><div><span>Started</span><strong>{current.startedOn || "Not recorded"}</strong></div><div><span>Completed</span><strong>{current.completedOn || "Not completed"}</strong></div></div></section>
      )}

      {tab === "Documents" && (
        <section className="contentSection moduleState"><span className="sectionKicker">Documents</span><h3>No document records are connected to this workspace yet.</h3><p>We will only show this section after document metadata is available through the backend.</p></section>
      )}
    </div>
  );
}
