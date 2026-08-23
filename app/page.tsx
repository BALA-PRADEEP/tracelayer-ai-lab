const demoQuestions = [
  "Why did Project Cedar exceed its material budget?",
  "Find similar roofing projects and compare their costs.",
  "Check current supplier prices for Project Cedar.",
];

export default function Home() {
  return (
    <main>
      <section className="hero shell">
        <div className="eyebrow">Bala Pradeep R · AI Engineer</div>
        <h1>Production AI systems you can inspect.</h1>
        <p className="lede">
          TraceLayer is a production-minded AI engineering lab. Ask a realistic business question,
          inspect the evidence, and see what the system did underneath.
        </p>

        <div className="actions">
          <a className="primary" href="#lab">Try the AI Lab</a>
          <a className="secondary" href="https://github.com/BALA-PRADEEP/tracelayer-ai-lab">View GitHub</a>
        </div>
      </section>

      <section className="shell lab" id="lab">
        <div className="sectionHeading">
          <span>01 / Live system</span>
          <h2>Ask about projects, costs, materials, and suppliers.</h2>
        </div>

        <div className="questionGrid">
          {demoQuestions.map((question) => (
            <button className="questionCard" key={question} type="button">
              <span>{question}</span>
              <span aria-hidden="true">↗</span>
            </button>
          ))}
        </div>

        <div className="terminalCard">
          <div className="terminalTop">
            <span className="statusDot" />
            <span>TraceLayer / foundation</span>
            <span className="muted">API wiring next</span>
          </div>
          <div className="terminalBody">
            <p className="prompt">$ system.status</p>
            <p>Frontend shell: ready</p>
            <p>FastAPI health endpoint: ready</p>
            <p>Operational data: pending Neon connection</p>
            <p>AI documents + retrieval: pending Atlas connection</p>
          </div>
        </div>
      </section>

      <section className="shell proof">
        <div>
          <span className="kicker">RAG</span>
          <p>Grounded retrieval with visible evidence.</p>
        </div>
        <div>
          <span className="kicker">TOOLS</span>
          <p>External-service calls separated from core AI logic.</p>
        </div>
        <div>
          <span className="kicker">TRACE</span>
          <p>Inspect retrieval, tools, validation, and latency.</p>
        </div>
        <div>
          <span className="kicker">RELIABILITY</span>
          <p>Failures, retries, and degraded states are designed intentionally.</p>
        </div>
      </section>
    </main>
  );
}
