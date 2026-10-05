export default function NewEscrowPage() {
  return (
    <div className="page-stack">
      <section className="panel wide-panel">
        <p className="eyebrow">Create escrow</p>
        <h1>New escrow wizard</h1>

        <div className="wizard-steps">
          <span className="step active">Counterparty</span>
          <span className="step">Contract</span>
          <span className="step">Milestones</span>
          <span className="step">Review</span>
          <span className="step">Create & fund</span>
        </div>

        <div className="two-col">
          <div className="info-card">
            <h3>Step 1 — Counterparty</h3>
            <label>
              <span>Freelancer wallet</span>
              <input type="text" value="7xK...9ab" readOnly />
            </label>
            <div className="risk-box"><strong>Wallet intelligence</strong><span>LOW</span><small>Coverage 87% • risk signal favorable</small></div>
          </div>

          <div className="info-card">
            <h3>Step 2 — Contract</h3>
            <label><span>Title</span><input type="text" value="Landing page redesign" /></label>
            <label><span>Total amount</span><input type="text" value="0.85 SOL" /></label>
            <label><span>Deadline</span><input type="text" value="2026-10-20" /></label>
          </div>
        </div>
      </section>
    </div>
  );
}
