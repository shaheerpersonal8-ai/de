export default function AdminDisputesPage() {
  const disputes = [
    { id: 'DP-114', milestone: 'Landing page', amount: '0.25 SOL', status: 'Open', created: '2 days ago' },
    { id: 'DP-108', milestone: 'API integration', amount: '0.4 SOL', status: 'Resolved', created: '5 days ago' }
  ];

  return (
    <div className="page-stack">
      <section className="panel">
        <p className="eyebrow">Admin disputes</p>
        <h1>Dispute resolution queue</h1>
        <div className="stat-grid">
          <div className="metric-card"><small>Open disputes</small><strong>{disputes.filter(d => d.status === 'Open').length}</strong></div>
          <div className="metric-card"><small>Pending review</small><strong>1</strong></div>
          <div className="metric-card"><small>Resolved this month</small><strong>8</strong></div>
          <div className="metric-card"><small>Avg. resolution time</small><strong>2.3 days</strong></div>
        </div>
      </section>

      <section className="panel">
        <h2>Disputes</h2>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Milestone</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {disputes.map((d) => (
                <tr key={d.id}>
                  <td><strong>{d.id}</strong></td>
                  <td>{d.milestone}</td>
                  <td>{d.amount}</td>
                  <td><span className="status-badge">{d.status}</span></td>
                  <td>{d.created}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
