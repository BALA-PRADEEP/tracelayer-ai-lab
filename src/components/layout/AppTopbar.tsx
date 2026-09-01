interface AppTopbarProps {
  title: string;
  context?: string;
}

export default function AppTopbar({ title, context }: AppTopbarProps) {
  return (
    <header className="topbar">
      <div className="topbarLocation">
        <span className="breadcrumb">{context ? `${context} /` : "Workspace /"}</span>
        <h1>{title}</h1>
      </div>
      <div className="topbarActions">
        <button className="globalSearch" type="button" aria-label="Search BuildPilot">
          <span>⌕</span>
          <span>Search projects, customers, POs…</span>
          <kbd>⌘K</kbd>
        </button>
        <button className="newButton" type="button">+ New</button>
      </div>
    </header>
  );
}
