"use client";

import { useMemo, useState } from "react";

const money = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

type Project = {
  name: string;
  customer: string;
  status: string;
  estimate: number;
  actual: number;
  margin: number;
  risk: "Healthy" | "Watch" | "At risk";
};

const projects: Project[] = [
  { name: "Project Cedar", customer: "Stark Roofing", status: "In progress", estimate: 82000, actual: 91700, margin: 14, risk: "At risk" },
  { name: "Project Atlas", customer: "Summit Construction", status: "In progress", estimate: 120000, actual: 118400, margin: 22, risk: "Healthy" },
  { name: "Project Falcon", customer: "Acme Homes", status: "Planning", estimate: 64000, actual: 0, margin: 27, risk: "Watch" },
  { name: "Project Summit", customer: "Northfield Builders", status: "In progress", estimate: 97000, actual: 88400, margin: 24, risk: "Healthy" },
];

const nav = ["Overview", "Customers", "Estimates", "Projects", "Procurement", "Finance"];

export default function Home() {
  const [active, setActive] = useState("Overview");
  const [selectedProject, setSelectedProject] = useState<Project>(projects[0]);
  const [agentOpen, setAgentOpen] = useState(false);

  const totals = useMemo(() => {
    const activeProjects = projects.filter((project) => project.status === "In progress").length;
    const atRisk = projects.filter((project) => project.risk === "At risk").length;
    const estimate = projects.reduce((sum, project) => sum + project.estimate, 0);
    const actual = projects.reduce((sum, project) => sum + project.actual, 0);
    return { activeProjects, atRisk, estimate, actual };
  }, []);

  return (
    <main className="appShell">
      <aside className="sidebar">
        <div className="brandBlock">
          <div className="brandMark">B</div>
          <div>
            <strong>BuildPilot</strong>
            <span>Construction operations</span>
          </div>
        </div>

        <nav className="sideNav" aria-label="Primary">
          {nav.map((item) => (
            <button
              key={item}
              className={active === item ? "navItem navItemActive" : "navItem"}
              type="button"
              onClick={() => setActive(item)}
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="sidebarFooter">
          <div className="userAvatar">BP</div>
          <div>
            <strong>Bala Pradeep</strong>
            <span>Project manager</span>
          </div>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <span className="breadcrumb">Workspace / {active}</span>
            <h1>{active}</h1>
          </div>
          <div className="topbarActions">
            <button className="ghostButton" type="button">Search</button>
            <button className="primaryButton" type="button">Create</button>
          </div>
        </header>

        <div className="contentWrap">
          {active === "Overview" && (
            <>
              <section className="welcomeRow">
                <div>
                  <p className="eyebrow">Today</p>
                  <h2>Here is what needs your attention.</h2>
                  <p className="subcopy">Track live project performance and act before cost issues become margin problems.</p>
                </div>
                <div className="healthPill">3 projects on track</div>
              </section>

              <section className="metricCards" aria-label="Business summary">
                <article className="metricCard"><span>Active projects</span><strong>{totals.activeProjects}</strong><small>Across current jobs</small></article>
                <article className="metricCard"><span>Projects at risk</span><strong>{totals.atRisk}</strong><small>Requires attention</small></article>
                <article className="metricCard"><span>Estimated value</span><strong>{money(totals.estimate)}</strong><small>Across visible projects</small></article>
                <article className="metricCard"><span>Actual cost</span><strong>{money(totals.actual)}</strong><small>Current recorded spend</small></article>
              </section>

              <section className="attentionCard">
                <div className="attentionTop">
                  <div>
                    <span className="sectionLabel">Needs attention</span>
                    <h3>Project Cedar is over its planned cost.</h3>
                  </div>
                  <span className="riskBadge">At risk</span>
                </div>
                <div className="attentionGrid">
                  <div><span>Estimate</span><strong>{money(projects[0].estimate)}</strong></div>
                  <div><span>Actual</span><strong>{money(projects[0].actual)}</strong></div>
                  <div><span>Variance</span><strong>+{money(projects[0].actual - projects[0].estimate)}</strong></div>
                  <div><span>Current margin</span><strong>{projects[0].margin}%</strong></div>
                </div>
                <div className="attentionActions">
                  <button className="primaryButton" type="button" onClick={() => { setSelectedProject(projects[0]); setAgentOpen(true); }}>Investigate</button>
                  <button className="ghostButton" type="button" onClick={() => { setActive("Projects"); setSelectedProject(projects[0]); }}>Open project</button>
                </div>
              </section>

              <section className="tableCard">
                <div className="sectionHeader">
                  <div>
                    <span className="sectionLabel">Projects</span>
                    <h3>Current work</h3>
                  </div>
                  <button className="textButton" type="button" onClick={() => setActive("Projects")}>View all projects</button>
                </div>
                <div className="projectTable" role="table">
                  <div className="projectRow projectHeader" role="row">
                    <span>Project</span><span>Customer</span><span>Status</span><span>Estimate</span><span>Actual</span><span>Margin</span><span>Health</span>
                  </div>
                  {projects.map((project) => (
                    <button className="projectRow projectButton" key={project.name} type="button" onClick={() => { setSelectedProject(project); setActive("Projects"); }}>
                      <strong>{project.name}</strong><span>{project.customer}</span><span>{project.status}</span><span>{money(project.estimate)}</span><span>{project.actual ? money(project.actual) : "—"}</span><span>{project.margin}%</span><span className={`healthTag ${project.risk === "At risk" ? "danger" : project.risk === "Watch" ? "warning" : "success"}`}>{project.risk}</span>
                    </button>
                  ))}
                </div>
              </section>
            </>
          )}

          {active === "Projects" && (
            <section className="projectWorkspace">
              <div className="projectTitleRow">
                <div>
                  <span className="sectionLabel">{selectedProject.customer}</span>
                  <h2>{selectedProject.name}</h2>
                  <p className="subcopy">Everything needed to understand and run this project in one place.</p>
                </div>
                <button className="primaryButton" type="button" onClick={() => setAgentOpen(true)}>Investigate project</button>
              </div>

              <div className="projectTabs">
                {['Overview','Estimate','Schedule','Materials','Purchase orders','Costs','Notes'].map((tab, index) => <button type="button" className={index === 0 ? "projectTab projectTabActive" : "projectTab"} key={tab}>{tab}</button>)}
              </div>

              <div className="projectSummaryGrid">
                <article><span>Project status</span><strong>{selectedProject.status}</strong></article>
                <article><span>Estimate</span><strong>{money(selectedProject.estimate)}</strong></article>
                <article><span>Actual cost</span><strong>{selectedProject.actual ? money(selectedProject.actual) : "Not started"}</strong></article>
                <article><span>Margin</span><strong>{selectedProject.margin}%</strong></article>
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
          )}

          {!['Overview','Projects'].includes(active) && (
            <section className="emptyModule">
              <span className="sectionLabel">BuildPilot workspace</span>
              <h2>{active}</h2>
              <p>This module is part of the application flow and will be built next around the construction workflow.</p>
            </section>
          )}
        </div>
      </section>

      {agentOpen && (
        <aside className="agentPanel" aria-label="BuildPilot investigation">
          <div className="agentHeader">
            <div><span className="sectionLabel">BuildPilot assistant</span><h3>Investigating {selectedProject.name}</h3></div>
            <button className="iconButton" type="button" onClick={() => setAgentOpen(false)}>×</button>
          </div>
          <div className="agentBody">
            <div className="agentPrompt">Why is this project going over budget?</div>
            <div className="agentAnswer">
              <span className="agentStatus">Analysis ready</span>
              <p>Material spend is the main pressure point. Shingle quantity and unit cost increased, while additional underlayment was added after scope changed.</p>
              <div className="agentFinding"><span>Material variance</span><strong>+$9,700</strong></div>
              <div className="agentFinding"><span>Largest driver</span><strong>Shingles</strong></div>
            </div>
            <div className="agentActions">
              <button className="primaryButton" type="button">Find lower-cost suppliers</button>
              <button className="ghostButton" type="button">Show supporting records</button>
            </div>
          </div>
          <div className="agentComposer">
            <input aria-label="Ask BuildPilot" placeholder="Ask about this project…" />
            <button className="primaryButton" type="button">Send</button>
          </div>
        </aside>
      )}
    </main>
  );
}
