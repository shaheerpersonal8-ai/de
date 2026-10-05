import { Link } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';

export default function LandingPage() {
  const { connected, publicKey, connectWallet } = useWallet();

  return (
    <div className="page-stack">
      <div className="hero-card">
        <div>
          <p className="eyebrow">Proofly</p>
          <h1>Proofly verifies the work before the money moves.</h1>
          <p className="lede">
            AI-assisted escrow with explicit milestone requirements, deterministic validation,
            signed attestation, and on-chain release.
          </p>

          <div className="action-row">
            <button className="primary-button" onClick={connectWallet}>
              {connected ? '✓ Wallet connected' : 'Connect wallet'}
            </button>
            <Link to="/evaluation" className="secondary-button">Run flow demo</Link>
          </div>

          {connected && publicKey && (
            <div className="panel" style={{ marginTop: 20 }}>
              <strong>Connected:</strong>
              <code style={{ display: 'block', marginTop: 4, fontSize: '0.875rem', wordBreak: 'break-all' }}>
                {publicKey}
              </code>
            </div>
          )}
        </div>

        <div className="hero-panel">
          <div className="mini-chart">
            <span>✓ Deterministic</span>
            <span>✓ AI Eval</span>
            <span>✓ Attestation</span>
            <span>→ Release</span>
          </div>
        </div>
      </div>

      <div className="stat-grid">
        <div className="metric-card">
          <small>Requirements</small>
          <strong>Canonicalized</strong>
          <span>Hash stored for verification</span>
        </div>
        <div className="metric-card">
          <small>Evidence</small>
          <strong>Hashed</strong>
          <span>Immutable proof of submission</span>
        </div>
        <div className="metric-card">
          <small>Evaluation</small>
          <strong>Policy Engine</strong>
          <span>Deterministic + AI results</span>
        </div>
        <div className="metric-card">
          <small>Attestation</small>
          <strong>Signed</strong>
          <span>Verified before release</span>
        </div>
      </div>
    </div>
  );
}
