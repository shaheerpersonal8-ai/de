import { NavLink, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ConnectPage from './pages/ConnectPage';
import DashboardPage from './pages/DashboardPage';
import EscrowsPage from './pages/EscrowsPage';
import EscrowDetailPage from './pages/EscrowDetailPage';
import WalletIntelligencePage from './pages/WalletIntelligencePage';
import ReputationPage from './pages/ReputationPage';
import SettingsPage from './pages/SettingsPage';

const navItems = [
  { to: '/', label: 'Landing' },
  { to: '/connect', label: 'Connect' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/escrows', label: 'Escrows' },
  { to: '/wallet-intelligence', label: 'Wallet Intel' },
  { to: '/reputation', label: 'Reputation' },
  { to: '/settings', label: 'Settings' }
];

function Layout() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-row">
          <div className="brand-mark">P</div>
          <div>
            <div className="brand-name">Proofly</div>
            <div className="eyebrow">Trusted work</div>
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
          <p className="eyebrow">Network</p>
          <strong>Solana Devnet</strong>
        </div>
      </aside>

      <div className="main-panel">
        <header className="topbar">
          <div className="search-box">Search wallets, escrows, contracts...</div>
          <div className="topbar-actions">
            <span className="pill">Connected</span>
            <span className="pill muted">7xK...9ab</span>
            <button className="primary-button small">Analyze wallet</button>
          </div>
        </header>

        <main className="content-area">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/connect" element={<ConnectPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/escrows" element={<EscrowsPage />} />
            <Route path="/escrow/:id" element={<EscrowDetailPage />} />
            <Route path="/wallet-intelligence" element={<WalletIntelligencePage />} />
            <Route path="/reputation" element={<ReputationPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<LandingPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return <Layout />;
}
