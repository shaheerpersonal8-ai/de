export default function FreelancerEarningsPage() {
  return (
    <div className="page-stack">
      <section className="panel">
        <p className="eyebrow">Freelancer earnings</p>
        <h1>Earnings</h1>
        <div className="stat-grid">
          <div className="metric-card"><small>Total verified earnings</small><strong>24.8 SOL</strong><span>lifetime</span></div>
          <div className="metric-card"><small>Pending</small><strong>3.1 SOL</strong><span>active</span></div>
          <div className="metric-card"><small>Released funds</small><strong>19.7 SOL</strong><span>paid</span></div>
          <div className="metric-card"><small>Monthly history</small><strong>+8.4 SOL</strong><span>this month</span></div>
        </div>
      </section>
    </div>
  );
}
