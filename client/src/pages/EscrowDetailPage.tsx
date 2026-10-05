import { escrows } from '../data/mockData';

export default function EscrowsPage() {
  return (
    <div className="page-stack">
      <section className="panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Escrow list</p>
            <h1>Escrows</h1>
          </div>
          <button className="primary-button">New escrow</button>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Contract</th>
                <th>Counterparty</th>
                <th>Amount</th>
                <th>Progress</th>
                <th>AI status</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {escrows.map((escrow) => (
                <tr key={escrow.id}>
                  <td>{escrow.title}</td>
                  <td>{escrow.counterparty}</td>
                  <td>{escrow.amount}</td>
                  <td>{escrow.progress}%</td>
                  <td>
                    <span className={`status-badge ${escrow.aiStatus === 'PASS' ? 'success' : ''}`}>
                      {escrow.aiStatus}
                    </span>
                  </td>
                  <td>{escrow.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
