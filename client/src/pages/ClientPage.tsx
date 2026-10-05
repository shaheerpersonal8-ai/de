import { NavLink, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ConnectPage from './pages/ConnectPage';
import DashboardPage from './pages/DashboardPage';
import ClientPage from './pages/ClientPage';
import FreelancerPage from './pages/FreelancerPage';
import EscrowsPage from './pages/EscrowsPage';
import NewEscrowPage from './pages/NewEscrowPage';
import EscrowDetailPage from './pages/EscrowDetailPage';
import MilestoneDetailPage from './pages/MilestoneDetailPage';
import SubmitDeliverablePage from './pages/SubmitDeliverablePage';
import EvaluationPage from './pages/EvaluationPage';
import WalletIntelligencePage from './pages/WalletIntelligencePage';
import WalletReportPage from './pages/WalletReportPage';
import PublicProfilePage from './pages/PublicProfilePage';
import ReputationPage from './pages/ReputationPage';
import ClientContractsPage from './pages/ClientContractsPage';
import ClientReviewsPage from './pages/ClientReviewsPage';
import ClientAnalyticsPage from './pages/ClientAnalyticsPage';
import FreelancerWorkPage from './pages/FreelancerWorkPage';
import FreelancerEarningsPage from './pages/FreelancerEarningsPage';
import FreelancerPortfolioPage from './pages/FreelancerPortfolioPage';
import MessagesPage from './pages/MessagesPage';
import NotificationsPage from './pages/NotificationsPage';
import DisputePage from './pages/DisputePage';
import SettingsPage from './pages/SettingsPage';
import AdminPage from './pages/AdminPage';
import AdminEvaluationPage from './pages/AdminEvaluationPage';

const navItems = [
  { to: '/', label: 'Landing' },
  { to: '/connect', label: 'Connect' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/client', label: 'Client' },
  { to: '/freelancer', label: 'Freelancer' },
  { to: '/escrows', label: 'Escrows' },
  { to: '/wallet-intelligence', label: 'Wallet Intel' },
  { to: '/reputation', label: 'Reputation' },
  { to: '/messages', label: 'Messages' },
  { to: '/notifications', label: 'Notifications' },
  { to: '/settings', label: 'Settings' },
  { to: '/admin', label: 'Admin' }
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
            <Route path="/client" element={<ClientPage />} />
            <Route path="/freelancer" element={<FreelancerPage />} />
            <Route path="/escrows" element={<EscrowsPage />} />
            <Route path="/escrows/new" element={<NewEscrowPage />} />
            <Route path="/escrow/:id" element={<EscrowDetailPage />} />
            <Route path="/escrow/:id/milestone/:index" element={<MilestoneDetailPage />} />
            <Route path="/escrow/:id/milestone/:index/submit" element={<SubmitDeliverablePage />} />
            <Route path="/evaluation/:id" element={<EvaluationPage />} />
            <Route path="/wallet-intelligence" element={<WalletIntelligencePage />} />
            <Route path="/wallet/:address" element={<WalletReportPage />} />
            <Route path="/profile/:wallet" element={<PublicProfilePage />} />
            <Route path="/reputation" element={<ReputationPage />} />
            <Route path="/client/contracts" element={<ClientContractsPage />} />
            <Route path="/client/reviews" element={<ClientReviewsPage />} />
            <Route path="/client/analytics" element={<ClientAnalyticsPage />} />
            <Route path="/freelancer/work" element={<FreelancerWorkPage />} />
            <Route path="/freelancer/earnings" element={<FreelancerEarningsPage />} />
            <Route path="/freelancer/portfolio" element={<FreelancerPortfolioPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/disputes/:id" element={<DisputePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/evaluations/:id" element={<AdminEvaluationPage />} />
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
