import { useState } from 'react';
import { useWalletAnalysis } from '../hooks/useWallet';

export default function WalletIntelligencePage() {
  const [address, setAddress] = useState('');
  const { analysis, loading, error, scan } = useWalletAnalysis(address);

  const handleScan = () => {
    if (address.trim()) {
      scan();
    }
  };

  return (
    <div className="page-stack">
      <section className="panel wide-panel">
        <p className="eyebrow">Wallet analysis</p>
        <h1>Analyze a wallet</h1>

        <div style={{ display: 'flex', gap: '10px', marginBottom: 20 }}>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter wallet address"
            style={{ flex: 1, padding: '8px' }}
          />
          <button className="primary-button" onClick={handleScan} disabled={loading}>
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>

        {error && <p className="muted" style={{ color: 'red' }}>Error: {error}</p>}
        {loading && <p className="muted">Loading wallet data...</p>}

        {analysis && (
          <div className="detail-grid">
            <div className="info-card">
              <h3>Wallet profile</h3>
              <div className="list-row">
                <span>Wallet</span>
                <strong>{analysis.wallet || address}</strong>
              </div>
              <div className="list-row">
                <span>Verified</span>
                <strong>{analysis.ownershipVerified ? 'Yes' : 'No'}</strong>
              </div>
              <div className="list-row">
                <span>Status</span>
                <strong>{analysis.walletActivity?.status || 'Unknown'}</strong>
              </div>
            </div>

            <div className="info-card">
              <h3>Risk assessment</h3>
              <div className="list-row">
                <span>Overall risk</span>
                <strong>{analysis.risk?.level || 'Unknown'}</strong>
              </div>
              <div className="list-row">
                <span>Score</span>
                <strong>{analysis.risk?.score !== null ? analysis.risk?.score : 'N/A'}</strong>
              </div>
              <div className="list-row">
                <span>Signals</span>
                <strong>{analysis.risk?.signals?.length || 0}</strong>
              </div>
            </div>

            {analysis.trading && (
              <div className="info-card">
                <h3>Trading P/L</h3>
                <div className="list-row">
                  <span>Realized</span>
                  <strong>{analysis.trading.realizedPnL || 'N/A'}</strong>
                </div>
                <div className="list-row">
                  <span>Unrealized</span>
                  <strong>{analysis.trading.unrealizedPnL || 'N/A'}</strong>
                </div>
                <div className="list-row">
                  <span>Volume</span>
                  <strong>{analysis.trading.tradingVolume || 'N/A'}</strong>
                </div>
              </div>
            )}

            {analysis.reliability && (
              <div className="info-card">
                <h3>Reliability</h3>
                <div className="list-row">
                  <span>Score</span>
                  <strong>{analysis.reliability.score !== null ? analysis.reliability.score : 'N/A'}</strong>
                </div>
                <div className="list-row">
                  <span>Label</span>
                  <strong>{analysis.reliability.label || 'N/A'}</strong>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
