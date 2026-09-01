"use client";

import { useMemo, useState } from "react";
import type { Project } from "../../interfaces/project";
import ProjectTable from "./ProjectTable";

interface ProjectListPageProps {
  projects: Project[];
  onOpen: (project: Project) => void;
}

export default function ProjectListPage({ projects, onOpen }: ProjectListPageProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"All" | "Active" | "At risk" | "Planning">("All");

  const visibleProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesQuery = `${project.name} ${project.customer}`.toLowerCase().includes(query.toLowerCase());
      const matchesFilter = filter === "All"
        || (filter === "Active" && project.status === "In progress")
        || (filter === "At risk" && project.risk === "At risk")
        || (filter === "Planning" && project.status === "Planning");
      return matchesQuery && matchesFilter;
    });
  }, [filter, projects, query]);

  return (
    <div className="pageStack">
      <section className="pageIntro pageIntroActions">
        <div>
          <p className="pageEyebrow">Work</p>
          <h2>Projects</h2>
          <p>Find a job, check its health, and move directly into the work that needs attention.</p>
        </div>
        <button className="primaryButton" type="button">+ New project</button>
      </section>

      <section className="contentSection">
        <div className="projectToolbar">
          <label className="searchField">
            <span className="srOnly">Search projects</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects or customers" />
          </label>
          <div className="filterTabs" aria-label="Project filters">
            {(["All", "Active", "At risk", "Planning"] as const).map((item) => (
              <button key={item} type="button" className={filter === item ? "filterTab filterTabActive" : "filterTab"} onClick={() => setFilter(item)}>
                {item}
              </button>
            ))}
          </div>
        </div>

        {visibleProjects.length > 0 ? (
          <ProjectTable projects={visibleProjects} onOpen={onOpen} />
        ) : (
          <div className="emptyState">
            <div className="emptyIcon">⌕</div>
            <h3>No projects match this view</h3>
            <p>Try a different search or clear the current filter.</p>
            <button className="secondaryButton" type="button" onClick={() => { setQuery(""); setFilter("All"); }}>Clear filters</button>
          </div>
        )}
      </section>
    </div>
  );
}
