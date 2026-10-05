export default function PublicProfilePage() {
  return (
    <div className="page-stack">
      <section className="panel">
        <p className="eyebrow">Public reputation</p>
        <h1>Jane Builder</h1>
        <div className="profile-header">
          <div className="avatar">JB</div>
          <div>
            <strong>7xK...9ab</strong>
            <div className="muted">Freelancer • Verified</div>
          </div>
        </div>
        <div className="two-col" style={{ marginTop: 20 }}>
          <div className="info-card"><h3>Verified milestones</h3><ul className="list-stack"><li>Landing Page — Verified</li><li>Dashboards — Verified</li><li>Brand System — Human reviewed</li></ul></div>
          <div className="info-card"><h3>Metrics</h3><div className="list-row"><span>Verified volume</span><strong>18.4 SOL</strong></div><div className="list-row"><span>AI-verified</span><strong>94%</strong></div><div className="list-row"><span>Dispute rate</span><strong>0.4%</strong></div></div>
        </div>
      </section>
    </div>
  );
}
