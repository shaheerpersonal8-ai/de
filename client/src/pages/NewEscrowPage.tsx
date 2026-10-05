export default function FreelancerPage() {
  return (
    <div className="page-stack">
      <section className="panel">
        <p className="eyebrow">Freelancer dashboard</p>
        <h1>Freelancer overview</h1>
        <div className="stat-grid">
          <div className="metric-card"><small>Total earned</small><strong>24.8 SOL</strong><span>Verified</span></div>
          <div className="metric-card"><small>Pending</small><strong>3.1 SOL</strong><span>3 milestones</span></div>
          <div className="metric-card"><small>Released</small><strong>19.7 SOL</strong><span>94% complete</span></div>
          <div className="metric-card"><small>Verified milestones</small><strong>17</strong><span>High trust</span></div>
        </div>
      </section>

      <section className="two-col">
        <div className="panel">
          <h2>Work queue</h2>
          <ul className="list-stack">
            <li>New invitation: Brand site system QA</li>
            <li>Active milestone: API contract review</li>
            <li>Due soon: community launch assets</li>
          </ul>
        </div>
        <div className="panel">
          <h2>Reputation growth</h2>
          <ul className="list-stack">
            <li>Verified work volume: 18.4 SOL</li>
            <li>Completion history rising steadily</li>
            <li>AI verification success: 94%</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
