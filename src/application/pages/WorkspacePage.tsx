"use client";

import { useState } from "react";
import AssistantPanel from "../../components/assistant/AssistantPanel";
import HomeDashboard from "../../components/dashboard/HomeDashboard";
import AppSidebar from "../../components/layout/AppSidebar";
import AppTopbar from "../../components/layout/AppTopbar";
import ProjectListPage from "../../components/projects/ProjectListPage";
import ProjectWorkspace from "../../components/projects/ProjectWorkspace";
import type { PrimaryNavigationItem } from "../../constants/navigation";
import { projects } from "../../data/projects";
import type { Project } from "../../interfaces/project";

export default function WorkspacePage() {
  const [active, setActive] = useState<PrimaryNavigationItem>("Overview");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [agentProject, setAgentProject] = useState<Project | null>(null);

  const navigate = (item: PrimaryNavigationItem) => {
    setActive(item);
    if (item !== "Projects") setSelectedProject(null);
  };

  const openProject = (project: Project) => {
    setSelectedProject(project);
    setActive("Projects");
  };

  return (
    <main className="appShell">
      <AppSidebar active={active} onNavigate={navigate} />

      <section className="workspace">
        <AppTopbar title={selectedProject ? selectedProject.name : active} context={selectedProject ? "Projects" : undefined} />
        <div className="contentWrap">
          {active === "Overview" && (
            <HomeDashboard projects={projects} onOpenProject={openProject} onInvestigate={setAgentProject} />
          )}

          {active === "Projects" && !selectedProject && (
            <ProjectListPage projects={projects} onOpen={openProject} />
          )}

          {active === "Projects" && selectedProject && (
            <ProjectWorkspace
              project={selectedProject}
              onBack={() => setSelectedProject(null)}
              onInvestigate={() => setAgentProject(selectedProject)}
            />
          )}

          {!(["Overview", "Projects"] as PrimaryNavigationItem[]).includes(active) && (
            <section className="emptyModule polishedEmpty">
              <div className="emptyIcon">+</div>
              <span className="sectionKicker">{active}</span>
              <h2>This workspace is coming next</h2>
              <p>We are building this area around the real user workflow rather than exposing incomplete screens.</p>
              <button className="secondaryButton" type="button" onClick={() => setActive("Overview")}>Return home</button>
            </section>
          )}
        </div>
      </section>

      {agentProject && <AssistantPanel project={agentProject} onClose={() => setAgentProject(null)} />}
    </main>
  );
}
