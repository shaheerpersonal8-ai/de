export default function EvaluationPage() {
  return (
    <div className="page-stack">
      <section className="panel">
        <p className="eyebrow">AI evaluation</p>
        <h1>Evaluation #EV-204</h1>

        <div className="two-col">
          <div className="info-card">
            <h3>Verdict</h3>
            <div className="list-row"><span>Evidence received</span><strong>✓</strong></div>
            <div className="list-row"><span>Deterministic checks</span><strong>✓</strong></div>
            <div className="list-row"><span>AI evaluation</span><strong>✓</strong></div>
            <div className="list-row"><span>Policy decision</span><strong>✓</strong></div>
          </div>
          <div className="info-card">
            <h3>Per requirement</h3>
            <ul className="list-stack">
              <li>R1 — PASS • confidence 99%</li>
              <li>R2 — PASS • confidence 98%</li>
              <li>R3 — PASS • confidence 94%</li>
              <li>R4 — PASS • confidence 97%</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
