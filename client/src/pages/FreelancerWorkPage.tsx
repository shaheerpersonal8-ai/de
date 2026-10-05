export default function ClientAnalyticsPage() {
  return (
    <div className="page-stack">
      <section className="panel">
        <p className="eyebrow">Client analytics</p>
        <h1>Performance overview</h1>
        <div className="stat-grid">
          <div className="metric-card"><small>Total spent</small><strong>18.2 SOL</strong><span>lifetime</span></div>
          <div className="metric-card"><small>Avg. milestone</small><strong>0.64 SOL</strong><span>value</span></div>
          <div className="metric-card"><small>Completion rate</small><strong>91%</strong><span>across contracts</span></div>
          <div className="metric-card"><small>Dispute rate</small><strong>2.1%</strong><span>very low</span></div>
        </div>
      </section>
    </div>
  );
}
