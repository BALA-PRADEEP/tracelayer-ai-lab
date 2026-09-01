"use client";

import { useMemo, useState } from "react";
import AssistantPanel from "../components/assistant/AssistantPanel";
import AppSidebar from "../components/layout/AppSidebar";
import AppTopbar from "../components/layout/AppTopbar";
import ProjectTable from "../components/projects/ProjectTable";
import ProjectWorkspace from "../components/projects/ProjectWorkspace";
import type { PrimaryNavigationItem } from "../constants/navigation";
import { projects } from "../data/projects";
import type { Project } from "../interfaces/project";
import { money } from "../utils/currency";

export default function WorkspacePage() {
  const [active, setActive] = useState<PrimaryNavigationItem>("Overview");
  const [selectedProject, setSelectedProject] = useState<Project>(projects[0]);
  const [agentOpen, setAgentOpen] = useState(false);

  const totals = useMemo(() => {
    const activeProjects = projects.filter((project) => project.status === "In progress").length;
    const atRisk = projects.filter((project) => project.risk === "At risk").length;
    const estimate = projects.reduce((sum, project) => sum + project.estimate, 0);
    const actual = projects.reduce((sum, project) => sum + project.actual, 0);
    return { activeProjects, atRisk, estimate, actual };
  }, []);

  const openProject = (project: Project) => {
    setSelectedProject(project);
    setActive("Projects");
  };

  return (
    <main className="appShell">
      <AppSidebar active={active} onNavigate={setActive} />

      <section className="workspace">
        <AppTopbar title={active} />
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
                  <div><span className="sectionLabel">Needs attention</span><h3>Project Cedar is over its planned cost.</h3></div>
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
                  <button className="ghostButton" type="button" onClick={() => openProject(projects[0])}>Open project</button>
                </div>
              </section>

              <section className="tableCard">
                <div className="sectionHeader">
                  <div><span className="sectionLabel">Projects</span><h3>Current work</h3></div>
                  <button className="textButton" type="button" onClick={() => setActive("Projects")}>View all projects</button>
                </div>
                <ProjectTable projects={projects} onOpen={openProject} />
              </section>
            </>
          )}

          {active === "Projects" && (
            <ProjectWorkspace project={selectedProject} onInvestigate={() => setAgentOpen(true)} />
          )}

          {!(["Overview", "Projects"] as PrimaryNavigationItem[]).includes(active) && (
            <section className="emptyModule">
              <span className="sectionLabel">BuildPilot workspace</span>
              <h2>{active}</h2>
              <p>This module is part of the application flow and will be built next around the construction workflow.</p>
            </section>
          )}
        </div>
      </section>

      {agentOpen && <AssistantPanel project={selectedProject} onClose={() => setAgentOpen(false)} />}
    </main>
  );
}
