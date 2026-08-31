"use client";

import { useState } from "react";

const demoQuestions = [
  "Why did Project Cedar exceed its material budget?",
  "Find similar roofing projects and compare their costs.",
  "Check current supplier prices for Project Cedar.",
];

type AnalysisResponse = {
  question: string;
  answer: string;
  summary: {
    estimated_total: number;
    actual_total: number;
    variance: number;
    variance_percent: number;
    material_budget: number;
  };
  reasons: Array<{
    material: string;
    variance: number;
    quantity_delta: number;
    unit_cost_delta: number;
    current_supplier_price: number | null;
    uom: string;
  }>;
  expenses: Array<{
    description: string;
    amount: number;
    vendor_name: string;
    incurred_on: string;
  }>;
  execution: Array<{
    step: string;
    status: string;
    detail: string;
  }>;
  mode: string;
};

const money = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

export default function Home() {
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTrace, setShowTrace] = useState(false);

  async function runCedarAnalysis() {
    setLoading(true);
    setError(null);
    setShowTrace(false);

    try {
      const response = await fetch("/api/demo/cedar-analysis", { cache: "no-store" });
      if (!response.ok) throw new Error(`Analysis request failed (${response.status})`);
      const data = (await response.json()) as AnalysisResponse;
      setAnalysis(data);
      requestAnimationFrame(() => {
        document.getElementById("answer")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to run analysis.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <section className="hero shell">
        <div className="eyebrow">BuildPilot · Construction Operations</div>
        <h1>Know where project costs are moving.</h1>
        <p className="lede">
          Monitor project performance, investigate cost overruns, compare supplier pricing,
          and make decisions with evidence from your operational data.
        </p>

        <div className="actions">
          <a className="primary" href="#assistant">Analyze a project</a>
          <a className="secondary" href="#operations">View operations</a>
        </div>
      </section>

      <section className="shell lab" id="assistant">
        <div className="sectionHeading">
          <span>Project intelligence</span>
          <h2>Ask BuildPilot about costs, materials, and suppliers.</h2>
        </div>

        <div className="questionGrid">
          {demoQuestions.map((question, index) => (
            <button
              className={`questionCard ${index === 0 ? "questionCardActive" : "questionCardMuted"}`}
              key={question}
              type="button"
              onClick={index === 0 ? runCedarAnalysis : undefined}
              disabled={index !== 0 || loading}
            >
              <span>{question}</span>
              <span className="questionMeta" aria-hidden="true">
                {index === 0 ? (loading ? "Running…" : "Analyze ↗") : "Coming soon"}
              </span>
            </button>
          ))}
        </div>

        {error && <div className="errorCard">{error}</div>}

        {analysis && (
          <div className="answerCard" id="answer">
            <div className="answerTop">
              <div>
                <span className="kicker">Project analysis</span>
                <h3>{analysis.question}</h3>
              </div>
              <span className="liveBadge">Operational data</span>
            </div>

            <p className="answerText">{analysis.answer}</p>

            <div className="metricGrid">
              <div><span>Estimate</span><strong>{money(analysis.summary.estimated_total)}</strong></div>
              <div><span>Actual</span><strong>{money(analysis.summary.actual_total)}</strong></div>
              <div><span>Variance</span><strong>{money(analysis.summary.variance)}</strong></div>
              <div><span>Over estimate</span><strong>{analysis.summary.variance_percent.toFixed(2)}%</strong></div>
            </div>

            <div className="evidenceSection">
              <div className="evidenceHeading">
                <span className="kicker">Supporting records</span>
                <span>{analysis.reasons.length + analysis.expenses.length} records used</span>
              </div>

              <div className="evidenceGrid">
                {analysis.reasons.map((reason) => (
                  <div className="evidenceCard" key={reason.material}>
                    <div className="evidenceTitle">{reason.material}</div>
                    <p>{money(reason.variance)} material variance</p>
                    <small>
                      Qty +{reason.quantity_delta} {reason.uom} · Unit cost +${reason.unit_cost_delta.toFixed(2)}
                    </small>
                    {reason.current_supplier_price !== null && (
                      <small>Current supplier price: ${reason.current_supplier_price.toFixed(2)} / {reason.uom}</small>
                    )}
                  </div>
                ))}

                {analysis.expenses.map((expense) => (
                  <div className="evidenceCard" key={`${expense.description}-${expense.incurred_on}`}>
                    <div className="evidenceTitle">Expense record</div>
                    <p>{expense.description}</p>
                    <small>{expense.vendor_name} · {money(expense.amount)}</small>
                  </div>
                ))}
              </div>
            </div>

            <div className="traceControl">
              <button className="traceButton" type="button" onClick={() => setShowTrace((value) => !value)}>
                {showTrace ? "Hide analysis steps" : "View analysis steps"}
              </button>
              <span>{analysis.mode.replaceAll("_", " ")}</span>
            </div>

            {showTrace && (
              <div className="tracePanel">
                {analysis.execution.map((item, index) => (
                  <div className="traceRow" key={item.step}>
                    <span className="traceIndex">{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <strong>{item.step}</strong>
                      <p>{item.detail}</p>
                    </div>
                    <span className="traceStatus">✓</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="terminalCard" id="operations">
          <div className="terminalTop">
            <span className="statusDot" />
            <span>BuildPilot / Operations</span>
            <span className="muted">Project + supplier data</span>
          </div>
          <div className="terminalBody">
            <p>Project data: connected</p>
            <p>Cost analysis: active</p>
            <p>Supplier pricing: connected</p>
            <p>Evidence checks: active</p>
            <p>Controlled actions: coming soon</p>
          </div>
        </div>
      </section>

      <section className="shell proof">
        <div>
          <span className="kicker">COST VISIBILITY</span>
          <p>See estimate versus actual performance and the records behind each variance.</p>
        </div>
        <div>
          <span className="kicker">MATERIAL INTELLIGENCE</span>
          <p>Understand which materials, quantities, and unit costs are moving project margin.</p>
        </div>
        <div>
          <span className="kicker">SUPPLIER OPTIONS</span>
          <p>Compare current supplier pricing against project needs before deciding what to do next.</p>
        </div>
        <div>
          <span className="kicker">CONTROLLED ACTIONS</span>
          <p>Keep recommendations evidence-backed and require approval before side effects are introduced.</p>
        </div>
      </section>
    </main>
  );
}
