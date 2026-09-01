"use client";

import { useEffect, useState } from "react";
import type { Project, SupplierOption } from "../../interfaces/project";
import { getProjectAnalysis, getSupplierOptions, type ProjectAnalysisResponse } from "../../services/ProjectService";
import { money } from "../../utils/currency";

interface AssistantPanelProps {
  project: Project;
  onClose: () => void;
}

type AgentView = "analysis" | "suppliers";

export default function AssistantPanel({ project, onClose }: AssistantPanelProps) {
  const [view, setView] = useState<AgentView>("analysis");
  const [analysis, setAnalysis] = useState<ProjectAnalysisResponse | null>(null);
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [supplierLoading, setSupplierLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(false);
    getProjectAnalysis(project.name)
      .then((result) => mounted && setAnalysis(result))
      .catch(() => mounted && setError(true))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [project.name]);

  const compareSuppliers = async () => {
    const sku = analysis?.reasons[0]?.sku;
    if (!sku) return;
    setSupplierLoading(true);
    try {
      setSuppliers(await getSupplierOptions(sku));
      setView("suppliers");
    } finally {
      setSupplierLoading(false);
    }
  };

  return (
    <>
      <button className="agentBackdrop" aria-label="Close BuildPilot" type="button" onClick={onClose} />
      <aside className="agentPanel" aria-label="BuildPilot investigation">
        <div className="agentHeader">
          <div>
            <span className="sectionKicker">BuildPilot</span>
            <h3>{view === "analysis" ? `Investigating ${project.name}` : "Compare suppliers"}</h3>
          </div>
          <button className="iconButton" type="button" onClick={onClose} aria-label="Close assistant">×</button>
        </div>

        <div className="agentBody">
          {view === "analysis" && loading && (
            <div className="agentProgress" aria-live="polite">
              <div><span className="progressCheck">•</span><span>Loading project budget</span></div>
              <div><span className="progressCheck">•</span><span>Checking material usage</span></div>
              <div><span className="progressCheck">•</span><span>Reviewing recorded expenses</span></div>
            </div>
          )}

          {view === "analysis" && error && (
            <section className="agentResult" role="alert">
              <span className="statusText dangerText">Analysis unavailable</span>
              <h4>I couldn't load enough project data to investigate this job.</h4>
              <p>Close this panel and try again after the project data is available.</p>
            </section>
          )}

          {view === "analysis" && analysis && !loading && (
            <>
              <div className="agentQuestion">Why is this project outside its estimate?</div>
              <div className="agentProgress" aria-label="Investigation completed">
                {analysis.execution.map((step) => <div key={step.step}><span className="progressCheck">✓</span><span>{step.step}</span></div>)}
              </div>

              <section className="agentResult">
                <span className="statusText successText">Analysis complete</span>
                <h4>{analysis.summary.variance > 0 ? "Recorded costs are above the project estimate." : "Recorded costs are within the project estimate."}</h4>
                <p>{analysis.answer}</p>
                <div className="agentMetric"><span>Project variance</span><strong>{analysis.summary.variance > 0 ? "+" : ""}{money(Number(analysis.summary.variance))}</strong></div>
                <div className="agentMetric"><span>Material variance</span><strong>{analysis.summary.material_variance > 0 ? "+" : ""}{money(Number(analysis.summary.material_variance))}</strong></div>
              </section>

              {analysis.reasons.length > 0 && (
                <section className="agentReasons">
                  <div className="sectionHeadingRow"><div><span className="sectionKicker">What's driving it</span></div></div>
                  {analysis.reasons.map((reason, index) => (
                    <div className="reasonRow" key={reason.sku}>
                      <span className="reasonNumber">{index + 1}</span>
                      <div><strong>{reason.material}</strong><small>{reason.quantity_delta > 0 ? `${reason.quantity_delta} ${reason.uom} above planned quantity` : "Quantity within plan"}</small></div>
                      <b className={reason.variance > 0 ? "dangerText" : "successText"}>{reason.variance > 0 ? "+" : ""}{money(Number(reason.variance))}</b>
                    </div>
                  ))}
                </section>
              )}

              {analysis.reasons[0] && (
                <section className="recommendationCard">
                  <span className="sectionKicker">Next check</span>
                  <h4>Compare current supplier prices for {analysis.reasons[0].material}</h4>
                  <p>Supplier options come from the latest supplier-price records stored in the application database.</p>
                  <button className="primaryButton fullButton" type="button" disabled={supplierLoading} onClick={() => void compareSuppliers()}>{supplierLoading ? "Loading suppliers…" : "Compare suppliers"}</button>
                </section>
              )}
            </>
          )}

          {view === "suppliers" && (
            <>
              <button className="backButton" type="button" onClick={() => setView("analysis")}>← Back to analysis</button>
              <div className="supplierContext">
                <span>{analysis?.reasons[0]?.material}</span>
                <strong>{suppliers.length} current supplier {suppliers.length === 1 ? "option" : "options"}</strong>
              </div>
              {suppliers.length > 0 ? (
                <div className="supplierCards">
                  {suppliers.map((supplier, index) => (
                    <article className={index === 0 && suppliers.length > 1 ? "recommendedSupplier" : ""} key={`${supplier.provider}-${supplier.sku}`}>
                      <div className="supplierTitle"><strong>{supplier.provider}</strong>{index === 0 && suppliers.length > 1 && <span className="recommendedBadge">Lowest current price</span>}</div>
                      <dl>
                        <div><dt>Price / {supplier.uom}</dt><dd>{money(Number(supplier.unit_price))}</dd></div>
                        <div><dt>Available</dt><dd>{supplier.available_quantity ?? "Not reported"}</dd></div>
                        <div><dt>Price date</dt><dd>{new Date(supplier.effective_at).toLocaleDateString()}</dd></div>
                      </dl>
                    </article>
                  ))}
                </div>
              ) : (
                <section className="agentResult"><span className="statusText warningText">No comparison available</span><h4>No supplier price records were found for this material.</h4><p>BuildPilot will not recommend a supplier without stored evidence.</p></section>
              )}
              <section className="approvalNotice"><span>Purchase orders are not enabled yet</span><p>The current application database does not yet contain the purchase-order model, so BuildPilot will not pretend to create one.</p></section>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
