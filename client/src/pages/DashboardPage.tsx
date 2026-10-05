export default function ConnectPage() {
  return (
    <div className="page-stack">
      <section className="panel wide-panel">
        <p className="eyebrow">Onboarding</p>
        <h1>Connect wallet</h1>
        <div className="stack gap-12">
          <div className="connect-box">
            <div>
              <strong>Solana wallet status</strong>
              <p>Wallet not connected yet</p>
            </div>
            <button className="primary-button">Connect Phantom</button>
          </div>

          <div className="grid-two">
            <div className="info-card">
              <h3>Profile</h3>
              <label>
                <span>Name</span>
                <input type="text" placeholder="Jane Builder" />
              </label>
              <label>
                <span>Bio</span>
                <textarea rows={4} placeholder="Product designer and Solana builder" />
              </label>
            </div>

            <div className="info-card">
              <h3>Role</h3>
              <div className="role-grid">
                <button className="secondary-button">Client</button>
                <button className="secondary-button">Freelancer</button>
                <button className="secondary-button">Both</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
