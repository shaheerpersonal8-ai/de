export default function WalletReportPage() {
  return (
    <div className="page-stack">
      <section className="panel">
        <p className="eyebrow">Wallet report</p>
        <h1>Wallet: 7xK...9ab</h1>
        <div className="stat-grid">
          <div className="metric-card"><small>Estimated P/L</small><strong>+14.7 SOL</strong><span>estimated</span></div>
          <div className="metric-card"><small>Trading volume</small><strong>$48.3k</strong><span>last 90 days</span></div>
          <div className="metric-card"><small>Risk</small><strong>LOW</strong><span>evidence-backed</span></div>
          <div className="metric-card"><small>Coverage</small><strong>87%</strong><span>data quality</span></div>
        </div>
      </section>
    </div>
  );
}
