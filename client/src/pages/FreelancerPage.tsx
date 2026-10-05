export default function ClientPage() {
  return (
    <div className="page-stack">
      <section className="panel">
        <p className="eyebrow">Client dashboard</p>
        <h1>Client overview</h1>
        <div className="stat-grid">
          <div className="metric-card"><small>Total funded</small><strong>18.2 SOL</strong><span>6 active escrows</span></div>
          <div className="metric-card"><small>Currently locked</small><strong>9.4 SOL</strong><span>2 pending reviews</span></div>
          <div className="metric-card"><small>Released</small><strong>6.8 SOL</strong><span>12 completed</span></div>
          <div className="metric-card"><small>Pending reviews</small><strong>4</strong><span>1 dispute</span></div>
        </div>
      </section>

      <section className="two-col">
        <div className="panel">
          <h2>Contracts</h2>
          <ul className="list-stack">
            <li>Landing Page Redesign — 0.85 SOL — Evaluating</li>
            <li>Brand Assets Package — 1.4 SOL — Active</li>
            <li>Protocol Analytics Dashboard — 2.4 SOL — Released</li>
          </ul>
        </div>
        <div className="panel">
          <h2>Pending evidence</h2>
          <ul className="list-stack">
            <li>Milestone 3: Figma handoff pending review</li>
            <li>AI evaluation ready for release</li>
            <li>Needs Review: mobile layout pass checks</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
