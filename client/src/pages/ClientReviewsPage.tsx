export default function ClientContractsPage() {
  return (
    <div className="page-stack">
      <section className="panel">
        <p className="eyebrow">Client contracts</p>
        <h1>Contracts</h1>
        <table>
          <thead><tr><th>Contract</th><th>Freelancer</th><th>Status</th><th>Amount</th></tr></thead>
          <tbody>
            <tr><td>Landing Page Redesign</td><td>7xK...9ab</td><td>Evaluating</td><td>0.85 SOL</td></tr>
            <tr><td>Protocol Assets</td><td>0xA3F...1C4</td><td>Active</td><td>1.4 SOL</td></tr>
            <tr><td>Design Sprint</td><td>4dQ...2FF</td><td>Released</td><td>2.2 SOL</td></tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}
