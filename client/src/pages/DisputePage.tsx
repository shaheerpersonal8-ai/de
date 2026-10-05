import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { useDispute } from '../hooks/useDispute';

export default function DisputePage() {
  const { id } = useParams<{ id: string }>();
  const { dispute, loading, error, resolveDispute } = useDispute(id);
  const [resolving, setResolving] = useState(false);
  const [resolution, setResolution] = useState('approve_freelancer');
  const [reasoning, setReasoning] = useState('');

  const handleResolve = async () => {
    if (!reasoning.trim()) {
      alert('Please provide reasoning');
      return;
    }

    try {
      setResolving(true);
      await resolveDispute(resolution as any, reasoning);
      alert('Dispute resolved successfully');
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setResolving(false);
    }
  };

  if (loading) return <div className="page-stack"><p>Loading dispute...</p></div>;
  if (error) return <div className="page-stack"><p style={{ color: 'red' }}>Error: {error}</p></div>;
  if (!dispute) return <div className="page-stack"><p>Dispute not found</p></div>;

  return (
    <div className="page-stack">
      <section className="panel">
        <p className="eyebrow">Dispute</p>
        <h1>Resolve Dispute</h1>

        <div className="info-card" style={{ marginBottom: 20 }}>
          <h3>Dispute details</h3>
          <div className="list-row">
            <span>Milestone ID</span>
            <strong>{dispute.milestoneId}</strong>
          </div>
          <div className="list-row">
            <span>Status</span>
            <strong>{dispute.status}</strong>
          </div>
          <div className="list-row">
            <span>Reason</span>
            <strong>{dispute.reason}</strong>
          </div>
          <div className="list-row">
            <span>Created</span>
            <strong>{new Date(dispute.createdAt).toLocaleString()}</strong>
          </div>
        </div>

        {dispute.status === 'open' && (
          <div className="info-card">
            <h3>Resolution</h3>
            <label>
              <span>Decision</span>
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  background: 'rgba(8,15,22,0.7)',
                  color: '#edf4ff',
                  border: '1px solid rgba(148,163,184,0.18)',
                  marginTop: 8,
                }}
              >
                <option value="approve_freelancer">Approve Freelancer</option>
                <option value="refund_client">Refund Client</option>
                <option value="partial_release">Partial Release</option>
              </select>
            </label>
            <label>
              <span>Reasoning</span>
              <textarea
                value={reasoning}
                onChange={(e) => setReasoning(e.target.value)}
                placeholder="Explain your decision..."
                style={{ marginTop: 8, minHeight: 100 }}
              />
            </label>
            <button
              className="primary-button"
              onClick={handleResolve}
              disabled={resolving}
              style={{ marginTop: 12 }}
            >
              {resolving ? 'Resolving...' : 'Resolve Dispute'}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
