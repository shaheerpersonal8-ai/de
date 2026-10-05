export default function ExplorePage() {
  const projects = [
    { id: 1, title: 'Landing Page Redesign', freelancer: 'Jane Builder', amount: '0.85 SOL', status: 'Active', rating: 4.9 },
    { id: 2, title: 'API Documentation', freelancer: 'Dev Master', amount: '1.2 SOL', status: 'Released', rating: 5.0 },
    { id: 3, title: 'Mobile App Design', freelancer: 'UI Expert', amount: '2.4 SOL', status: 'Evaluating', rating: 4.7 }
  ];

  return (
    <div className="page-stack">
      <section className="panel wide-panel">
        <p className="eyebrow">Discovery</p>
        <h1>Explore verified work</h1>
        
        <div className="search-row" style={{ marginBottom: 24 }}>
          <input type="text" placeholder="Search projects, freelancers, skills..." />
          <button className="primary-button">Search</button>
        </div>

        <div className="filter-row" style={{ marginBottom: 24 }}>
          <button className="secondary-button">Status: All</button>
          <button className="secondary-button">Amount: Any</button>
          <button className="secondary-button">Rating: All</button>
          <button className="secondary-button">Skills: Any</button>
        </div>
      </section>

      <section className="panel">
        <h2>Featured projects</h2>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Project</th>
                <th>Freelancer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id}>
                  <td>{p.title}</td>
                  <td>{p.freelancer}</td>
                  <td>{p.amount}</td>
                  <td><span className="status-badge">{p.status}</span></td>
                  <td>★ {p.rating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
