interface AppTopbarProps {
  title: string;
}

export default function AppTopbar({ title }: AppTopbarProps) {
  return (
    <header className="topbar">
      <div>
        <span className="breadcrumb">Workspace / {title}</span>
        <h1>{title}</h1>
      </div>
      <div className="topbarActions">
        <button className="ghostButton" type="button">Search</button>
        <button className="primaryButton" type="button">Create</button>
      </div>
    </header>
  );
}
