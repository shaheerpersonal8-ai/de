import { Link } from 'react-router-dom';
import { useEscrows } from '../hooks/useEscrows';

export default function EscrowsPage() {
  const { escrows, loading, error } = useEscrows();

  return (
    <div className="page-stack">
      <section className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <p className="eyebrow">Escrow list</p>
            <h1>Escrows</h1>
          </div>
          <Link to="/escrows/new" className="primary-button">Create escrow</Link>
        </div>

        {error && <p className="muted" style={{ color: 'red' }}>Error: {error}</p>}
        {loading && <p className="muted">Loading escrows...</p>}
        {!loading && escrows.length === 0 && <p>No escrows found.</p>}
        {!loading && escrows.length > 0 && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Contract</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {escrows.map((item: any) => (
                  <tr key={item.address || item.id}>
                    <td>{item.title || item.description || 'Untitled'}</td>
                    <td><span className="status-badge">{item.status || 'Active'}</span></td>
                    <td>{item.totalAmount ? `${item.totalAmount} SOL` : item.amount ? `${item.amount} SOL` : '—'}</td>
                    <td>
                      <Link to={`/escrow/${item.address || item.id}`} className="secondary-button">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
