export default function MilestoneDetailPage() {
  return (
    <div className="page-stack">
      <section className="panel">
        <p className="eyebrow">Milestone detail</p>
        <h1>Landing Page — 0.05 SOL</h1>
        <div className="two-col">
          <div className="info-card">
            <h3>Frozen requirements</h3>
            <ul className="list-stack">
              <li>R1 — Deployment URL reachable</li>
              <li>R2 — Home, Pricing, Contact</li>
              <li>R3 — Approved logo</li>
              <li>R4 — Mobile layout</li>
            </ul>
          </div>
          <div className="info-card">
            <h3>AI result</h3>
            <div className="list-row"><span>Status</span><strong>PASS</strong></div>
            <div className="list-row"><span>Confidence</span><strong>98%</strong></div>
            <div className="list-row"><span>Evidence</span><strong>Screenshot + URL</strong></div>
          </div>
        </div>
      </section>
    </div>
  );
}
