export default function AdminPage() {
  return (
    <div className="page-stack">
      <section className="panel">
        <p className="eyebrow">Admin dashboard</p>
        <h1>Governance & review</h1>
        <div className="stat-grid">
          <div className="metric-card"><small>Needs review</small><strong>6</strong><span>cases</span></div>
          <div className="metric-card"><small>Open disputes</small><strong>2</strong><span>active</span></div>
          <div className="metric-card"><small>Failed jobs</small><strong>1</strong><span>AI queue</span></div>
          <div className="metric-card"><small>Attestation status</small><strong>Healthy</strong><span>on-chain</span></div>
        </div>
      </section>
    </div>
  );
}
