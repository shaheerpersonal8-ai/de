import { Link } from 'react-router-dom';

const featureCards = [
  {
    title: 'Trusted work',
    text: 'Escrow -> Requirements -> Evidence -> AI checks -> Attestation -> Release.'
  },
  {
    title: 'Portable reputation',
    text: 'Verified milestones become on-chain proof and wallet-level trust signals.'
  },
  {
    title: 'Counterparty intelligence',
    text: 'Analyze wallet history, risk signals and financial behavior before moving value.'
  }
];

export default function LandingPage() {
  return (
    <div className="page-stack">
      <section className="hero-card">
        <div>
          <p className="eyebrow">AI-verified escrow and reputation</p>
          <h1>Verify the work before the money moves.</h1>
          <p className="lede">
            Proofly combines escrow, evidence, AI evaluation, and wallet intelligence into a clear
            trust layer for freelance delivery and on-chain work.
          </p>
          <div className="action-row">
            <Link to="/connect" className="primary-button">Create an escrow</Link>
            <Link to="/wallet-intelligence" className="secondary-button">Analyze a wallet</Link>
          </div>
        </div>
        <div className="hero-panel">
          <div className="mini-chart">
            <span>Requirements</span>
            <span>Work</span>
            <span>Verify</span>
            <span>Release</span>
          </div>
          <div className="stat-grid compact">
            <div className="metric-card">
              <strong>98%</strong>
              <small>AI confidence</small>
            </div>
            <div className="metric-card">
              <strong>Low</strong>
              <small>Risk signal</small>
            </div>
          </div>
        </div>
      </section>

      <section className="content-grid three-up">
        {featureCards.map((card) => (
          <div key={card.title} className="info-card">
            <h3>{card.title}</h3>
            <p>{card.text}</p>
          </div>
        ))}
      </section>

      <section className="two-col">
        <div className="panel">
          <h2>Wallet intelligence preview</h2>
          <div className="list-row">
            <span>Wallet</span>
            <strong>7xK...9ab</strong>
          </div>
          <div className="list-row">
            <span>P/L</span>
            <strong>+14.7 SOL</strong>
          </div>
          <div className="list-row">
            <span>Risk</span>
            <strong className="success">LOW</strong>
          </div>
        </div>

        <div className="panel">
          <h2>Verified reputation preview</h2>
          <div className="list-row">
            <span>Verified milestones</span>
            <strong>17</strong>
          </div>
          <div className="list-row">
            <span>Completed value</span>
            <strong>18.4 SOL</strong>
          </div>
          <div className="list-row">
            <span>AI review rate</span>
            <strong>94%</strong>
          </div>
        </div>
      </section>
    </div>
  );
}
