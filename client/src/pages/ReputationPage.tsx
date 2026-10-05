import { useState, useEffect } from 'react';
import apiClient from '../services/api';

export default function ReputationPage() {
  const [wallet, setWallet] = useState('');
  const [reputation, setReputation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async () => {
    if (!wallet.trim()) {
      setError('Please enter a wallet address');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getWalletProfile(wallet);
      setReputation(data);
    } catch (err: any) {
      setError(err.message);
      setReputation(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-stack">
      <section className="panel wide-panel">
        <p className="eyebrow">On-chain reputation</p>
        <h1>Reputation</h1>

        <div style={{ display: 'flex', gap: '10px', marginBottom: 20 }}>
          <input
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
            placeholder="Enter wallet address to lookup"
            style={{ flex: 1, padding: '8px' }}
          />
          <button className="primary-button" onClick={handleScan} disabled={loading}>
            {loading ? 'Loading...' : 'View reputation'}
          </button>
        </div>

        {error && <p className="muted" style={{ color: 'red' }}>Error: {error}</p>}
        {loading && <p className="muted">Loading reputation data...</p>}

        {reputation && (
          <div className="detail-grid">
            <div className="info-card">
              <h3>Professional history</h3>
              {reputation.professionalHistory ? (
                <>
                  <div className="list-row">
                    <span>Completed contracts</span>
                    <strong>{reputation.professionalHistory.completedContracts || 0}</strong>
                  </div>
                  <div className="list-row">
                    <span>Milestone releases</span>
                    <strong>{reputation.professionalHistory.milestoneReleases || 0}</strong>
                  </div>
                  <div className="list-row">
                    <span>Disputes</span>
                    <strong>{reputation.professionalHistory.disputes || 0}</strong>
                  </div>
                </>
              ) : (
                <p>No professional history</p>
              )}
            </div>

            <div className="info-card">
              <h3>Reliability</h3>
              {reputation.reliability ? (
                <>
                  <div className="list-row">
                    <span>Score</span>
                    <strong>{reputation.reliability.score !== null ? reputation.reliability.score : 'N/A'}</strong>
                  </div>
                  <div className="list-row">
                    <span>Label</span>
                    <strong>{reputation.reliability.label || 'N/A'}</strong>
                  </div>
                </>
              ) : (
                <p>Insufficient data</p>
              )}
            </div>

            {reputation.risk && (
              <div className="info-card">
                <h3>Risk signals</h3>
                <div className="list-row">
                  <span>Level</span>
                  <strong>{reputation.risk.level || 'Unknown'}</strong>
                </div>
                <div className="list-row">
                  <span>Count</span>
                  <strong>{reputation.risk.signals?.length || 0}</strong>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
