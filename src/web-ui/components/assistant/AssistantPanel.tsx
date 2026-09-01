"use client";

import { useState } from "react";
import type { Project } from "../../interfaces/project";

interface AssistantPanelProps {
  project: Project;
  onClose: () => void;
}

type AgentView = "analysis" | "suppliers" | "purchase" | "success";

export default function AssistantPanel({ project, onClose }: AssistantPanelProps) {
  const [view, setView] = useState<AgentView>("analysis");

  return (
    <>
      <button className="agentBackdrop" aria-label="Close BuildPilot" type="button" onClick={onClose} />
      <aside className="agentPanel" aria-label="BuildPilot investigation">
        <div className="agentHeader">
          <div>
            <span className="sectionKicker">BuildPilot</span>
            <h3>{view === "analysis" ? `Investigating ${project.name}` : view === "suppliers" ? "Compare suppliers" : view === "purchase" ? "Review purchase order" : "Purchase order created"}</h3>
          </div>
          <button className="iconButton" type="button" onClick={onClose} aria-label="Close assistant">×</button>
        </div>

        <div className="agentBody">
          {view === "analysis" && (
            <>
              <div className="agentQuestion">Why is this project going over budget?</div>
              <div className="agentProgress" aria-label="Investigation completed">
                <div><span className="progressCheck">✓</span><span>Reviewed project budget</span></div>
                <div><span className="progressCheck">✓</span><span>Checked material usage</span></div>
                <div><span className="progressCheck">✓</span><span>Reviewed purchase records</span></div>
                <div><span className="progressCheck">✓</span><span>Checked supplier pricing</span></div>
              </div>

              <section className="agentResult">
                <span className="statusText successText">Analysis complete</span>
                <h4>Material costs are driving the overrun.</h4>
                <p>Your material plan was $42,000. Recorded spend is $51,700, putting the project $9,700 above plan.</p>
                <div className="agentMetric"><span>Material variance</span><strong>+$9,700</strong></div>
              </section>

              <section className="agentReasons">
                <div className="sectionHeadingRow"><div><span className="sectionKicker">What's driving it</span></div></div>
                <div className="reasonRow"><span className="reasonNumber">1</span><div><strong>Architectural shingles</strong><small>Higher quantity and unit price</small></div><b>+$7,200</b></div>
                <div className="reasonRow"><span className="reasonNumber">2</span><div><strong>Underlayment</strong><small>Additional material recorded</small></div><b>+$900</b></div>
                <div className="reasonRow"><span className="reasonNumber">3</span><div><strong>Drip edge</strong><small>Usage above original plan</small></div><b>+$650</b></div>
              </section>

              <section className="recommendationCard">
                <span className="sectionKicker">Recommended next step</span>
                <h4>Compare suppliers for the remaining shingles</h4>
                <p>There are 32 SQ remaining. Another vendor may reduce the projected cost without extending lead time.</p>
                <button className="primaryButton fullButton" type="button" onClick={() => setView("suppliers")}>Compare suppliers</button>
              </section>
            </>
          )}

          {view === "suppliers" && (
            <>
              <button className="backButton" type="button" onClick={() => setView("analysis")}>← Back to analysis</button>
              <div className="supplierContext">
                <span>Architectural shingles</span>
                <strong>32 SQ needed</strong>
              </div>
              <div className="supplierCards">
                <article><div className="supplierTitle"><strong>ABC Supply</strong><span className="currentBadge">Current</span></div><dl><div><dt>Price / SQ</dt><dd>$94</dd></div><div><dt>Available</dt><dd>50 SQ</dd></div><div><dt>Lead time</dt><dd>1 day</dd></div><div><dt>Order cost</dt><dd>$3,008</dd></div></dl></article>
                <article className="recommendedSupplier"><div className="supplierTitle"><strong>SRS Distribution</strong><span className="recommendedBadge">Recommended</span></div><dl><div><dt>Price / SQ</dt><dd>$91</dd></div><div><dt>Available</dt><dd>40 SQ</dd></div><div><dt>Lead time</dt><dd>1 day</dd></div><div><dt>Order cost</dt><dd>$2,912</dd></div></dl><p className="savingText">Save $96 with full quantity coverage.</p></article>
                <article><div className="supplierTitle"><strong>Beacon</strong></div><dl><div><dt>Price / SQ</dt><dd>$88</dd></div><div><dt>Available</dt><dd>26 SQ</dd></div><div><dt>Lead time</dt><dd>2 days</dd></div><div><dt>Coverage</dt><dd className="warningText">Insufficient</dd></div></dl></article>
              </div>
              <button className="primaryButton fullButton" type="button" onClick={() => setView("purchase")}>Use SRS Distribution</button>
            </>
          )}

          {view === "purchase" && (
            <>
              <button className="backButton" type="button" onClick={() => setView("suppliers")}>← Back to suppliers</button>
              <div className="approvalNotice"><span>Approval required</span><p>BuildPilot prepared this draft. Nothing will be created until you approve it.</p></div>
              <section className="purchaseReview">
                <div className="reviewRow"><span>Project</span><strong>{project.name}</strong></div>
                <div className="reviewRow"><span>Vendor</span><strong>SRS Distribution</strong></div>
                <div className="purchaseItem"><div><strong>Architectural shingles</strong><small>32 SQ × $91</small></div><b>$2,912</b></div>
                <div className="reviewTotal"><span>Total</span><strong>$2,912</strong></div>
                <div className="reviewRow"><span>Expected delivery</span><strong>Sep 04</strong></div>
              </section>
              <section className="recommendationCard compactRecommendation"><span className="sectionKicker">Why this option</span><p>SRS covers the full quantity, keeps the one-day lead time, and reduces the remaining order cost by $96.</p></section>
              <div className="approvalActions"><button className="secondaryButton" type="button" onClick={() => setView("suppliers")}>Cancel</button><button className="primaryButton" type="button" onClick={() => setView("success")}>Approve & create PO</button></div>
            </>
          )}

          {view === "success" && (
            <div className="successState">
              <div className="successIcon">✓</div>
              <span className="statusText successText">Created successfully</span>
              <h4>Purchase order #1052 is ready.</h4>
              <p>SRS Distribution · $2,912 · Expected Sep 04</p>
              <button className="primaryButton fullButton" type="button">View purchase order</button>
              <button className="textButton" type="button" onClick={onClose}>Close</button>
            </div>
          )}
        </div>

        {view === "analysis" && (
          <div className="agentComposer">
            <input aria-label="Ask BuildPilot" placeholder="Ask about this project…" />
            <button className="primaryButton" type="button">Send</button>
          </div>
        )}
      </aside>
    </>
  );
}
