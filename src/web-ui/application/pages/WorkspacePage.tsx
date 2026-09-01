"use client";

import { useEffect, useState } from "react";
import AssistantPanel from "../../components/assistant/AssistantPanel";
import HomeDashboard from "../../components/dashboard/HomeDashboard";
import AppSidebar from "../../components/layout/AppSidebar";
import AppTopbar from "../../components/layout/AppTopbar";
import ProjectListPage from "../../components/projects/ProjectListPage";
import ProjectWorkspace from "../../components/projects/ProjectWorkspace";
import type { PrimaryNavigationItem } from "../../constants/navigation";
import type { Project } from "../../interfaces/project";
import { getProjects } from "../../services/ProjectService";

export default function WorkspacePage() {
  const [active, setActive] = useState<PrimaryNavigationItem>("Overview");
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [agentProject, setAgentProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      setProjects(await getProjects());
    } catch {
      setError("We couldn't load project data. Your data has not been changed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProjects();
  }, []);

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
          {loading && (
            <section className="contentSection moduleState" aria-live="polite">
              <span className="sectionKicker">Loading workspace</span>
              <h3>Getting the latest project data…</h3>
              <p>BuildPilot is loading projects, budgets, and current recorded costs.</p>
            </section>
          )}

          {!loading && error && (
            <section className="contentSection moduleState" role="alert">
              <span className="sectionKicker">Unable to load</span>
              <h3>Project data is unavailable right now.</h3>
              <p>{error}</p>
              <button className="primaryButton" type="button" onClick={() => void loadProjects()}>Try again</button>
            </section>
          )}

          {!loading && !error && active === "Overview" && (
            <HomeDashboard projects={projects} onOpenProject={openProject} onInvestigate={setAgentProject} />
          )}

          {!loading && !error && active === "Projects" && !selectedProject && (
            <ProjectListPage projects={projects} onOpen={openProject} />
          )}

          {!loading && !error && active === "Projects" && selectedProject && (
            <ProjectWorkspace
              project={selectedProject}
              onBack={() => setSelectedProject(null)}
              onInvestigate={() => setAgentProject(selectedProject)}
            />
          )}

          {!loading && !error && !(["Overview", "Projects"] as PrimaryNavigationItem[]).includes(active) && (
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
