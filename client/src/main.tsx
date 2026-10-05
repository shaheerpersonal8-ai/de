import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import EvaluationPage from './pages/EvaluationPage';
import { WalletProvider } from './context/WalletContext';
import './styles.css';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/evaluation', label: 'Evaluation' },
];

function Layout() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-row">
          <div className="brand-mark">P</div>
          <div>
            <div className="brand-name">Proofly</div>
            <div className="eyebrow">AI-Verified Escrow</div>
          </div>
        </div>

        <nav className="nav-list">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-card">
          <p className="eyebrow">Status</p>
          <strong>MVP Dev</strong>
          <small style={{ display: 'block', marginTop: 8, color: '#666' }}>
            Solana Devnet
          </small>
        </div>
      </aside>

      <div className="main-panel">
        <header className="topbar">
          <div className="search-box">Requirements → Evidence → Evaluation → Attestation → Release</div>
          <div className="topbar-actions">
            <span className="pill">API: localhost:3000</span>
          </div>
        </header>

        <main className="content-area">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/evaluation" element={<EvaluationPage />} />
            <Route path="*" element={<LandingPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WalletProvider>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </WalletProvider>
  </React.StrictMode>
);
