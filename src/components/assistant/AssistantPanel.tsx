import type { Project } from "../../interfaces/project";

interface AssistantPanelProps {
  project: Project;
  onClose: () => void;
}

export default function AssistantPanel({ project, onClose }: AssistantPanelProps) {
  return (
    <aside className="agentPanel" aria-label="BuildPilot investigation">
      <div className="agentHeader">
        <div><span className="sectionLabel">BuildPilot assistant</span><h3>Investigating {project.name}</h3></div>
        <button className="iconButton" type="button" onClick={onClose}>×</button>
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
  );
}
