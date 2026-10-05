:root {
  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #e7edf7;
  background: #08101e;
  line-height: 1.5;
  font-weight: 400;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

* {
  box-sizing: border-box;
}

html, body, #root {
  margin: 0;
  min-height: 100%;
  min-height: 100vh;
  background: linear-gradient(180deg, #08101e 0%, #0d1728 100%);
}

a {
  color: inherit;
  text-decoration: none;
}

button, input, textarea {
  font: inherit;
}

button {
  border: 0;
  cursor: pointer;
}

.app-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 260px 1fr;
}

.sidebar {
  background: rgba(9, 15, 25, 0.92);
  border-right: 1px solid rgba(148, 163, 184, 0.18);
  padding: 24px 18px;
}

.brand-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 28px;
}

.brand-mark {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: linear-gradient(135deg, #4ade80, #22c55e);
  color: #02110a;
  font-weight: 800;
}

.brand-name {
  font-weight: 700;
  font-size: 1.2rem;
}

.eyebrow {
  margin: 0 0 8px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.7rem;
  color: #8eb6ff;
}

.nav-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-link {
  color: #dfeafc;
  padding: 10px 12px;
  border-radius: 10px;
  transition: 0.2s ease;
}

.nav-link.active,
.nav-link:hover {
  background: rgba(59, 130, 246, 0.12);
  color: #fff;
}

.sidebar-card {
  margin-top: 30px;
  padding: 14px 12px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 14px;
}

.main-panel {
  display: flex;
  flex-direction: column;
}

.topbar {
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.15);
  background: rgba(7, 12, 20, 0.8);
  backdrop-filter: blur(10px);
}

.search-box {
  width: min(420px, 60%);
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  color: #99a9c2;
  background: rgba(15, 23, 42, 0.75);
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pill {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 0.8rem;
  background: rgba(34, 197, 94, 0.14);
  color: #8af2b2;
}

.pill.muted {
  background: rgba(148, 163, 184, 0.12);
  color: #dfeafc;
}

.content-area {
  padding: 28px;
}

.page-stack {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.hero-card,
.panel,
.info-card,
.metric-card {
  background: rgba(15, 23, 42, 0.82);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 20px;
}

.hero-card {
  display: grid;
  grid-template-columns: 1.3fr 0.7fr;
  gap: 18px;
  padding: 28px;
}

.hero-card h1,
.panel h1 {
  margin: 0 0 12px;
  font-size: clamp(2.2rem, 3vw, 3.4rem);
  line-height: 1.08;
}

.lede {
  margin: 0;
  max-width: 700px;
  color: #c9d5eb;
  font-size: 1.08rem;
}

.action-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 18px;
}

.primary-button,
.secondary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 10px 18px;
  border-radius: 12px;
  font-weight: 600;
  transition: 0.2s ease;
}

.primary-button {
  background: linear-gradient(135deg, #60a5fa, #22c55e);
  color: #03131d;
}

.secondary-button {
  background: rgba(148, 163, 184, 0.08);
  color: #edf4ff;
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.primary-button.small {
  min-height: 34px;
  padding: 8px 12px;
  font-size: 0.82rem;
}

.hero-panel {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 16px;
  padding: 18px;
  border-radius: 16px;
  background: rgba(8, 15, 22, 0.8);
}

.mini-chart {
  display: grid;
  grid-template-columns: repeat(2, minmax(120px, 1fr));
  gap: 12px;
}

.mini-chart span {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 86px;
  border-radius: 14px;
  background: rgba(59, 130, 246, 0.08);
  border: 1px solid rgba(96, 165, 250, 0.2);
}

.content-grid,
.two-col,
.grid-two,
.detail-grid,
.stat-grid {
  display: grid;
  gap: 18px;
}

.three-up {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.two-col,
.grid-two,
.detail-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.stat-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.info-card,
.panel {
  padding: 20px;
}

.info-card h3,
.panel h2 {
  margin: 0 0 14px;
}

.list-row,
.risk-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
}

.list-row:last-child,
.risk-row:last-child {
  border-bottom: 0;
}

.metric-card {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.metric-card strong {
  font-size: 1.8rem;
}

.metric-card small,
.metric-card span,
.muted,
small {
  color: #a9b9d0;
}

.panel {
  width: 100%;
}

.wide-panel {
  max-width: 1200px;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.table-wrapper {
  overflow-x: auto;
  margin-top: 16px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  text-align: left;
  padding: 14px 12px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
}

th {
  color: #9db3d2;
  font-weight: 600;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 76px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.12);
  color: #bfdbfe;
  font-size: 0.8rem;
}

.status-badge.success {
  background: rgba(34, 197, 94, 0.1);
  color: #8af2b2;
}

.stack {
  display: flex;
  flex-direction: column;
}

.gap-12 {
  gap: 12px;
}

.connect-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px;
  border-radius: 16px;
  background: rgba(8, 15, 22, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.18);
}

label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
  color: #dbe8ff;
}

input,
textarea {
  width: 100%;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 12px;
  background: rgba(8, 15, 22, 0.7);
  color: #edf4ff;
  padding: 12px 14px;
}

.role-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 14px;
}

.avatar {
  width: 50px;
  height: 50px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: linear-gradient(135deg, #0ea5e9, #8b5cf6);
  font-weight: 700;
}

.list-stack {
  margin: 0;
  padding-left: 18px;
  color: #dfeafc;
  display: grid;
  gap: 10px;
}

.milestone-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
}

.milestone-card strong,
.risk-box strong {
  display: block;
}

.risk-box {
  padding: 10px 0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
}

.risk-box span {
  display: inline-block;
  margin-top: 6px;
  font-weight: 700;
  color: #8af2b2;
}

.risk-box small {
  display: block;
  margin-top: 4px;
}

.success {
  color: #8af2b2;
}

.wizard-steps {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 20px 0 24px;
}

.step {
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.1);
  color: #dfeafc;
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.step.active {
  background: rgba(34, 197, 94, 0.12);
  color: #8af2b2;
  border-color: rgba(34, 197, 94, 0.4);
}

@media (max-width: 980px) {
  .app-shell {
    grid-template-columns: 1fr;
  }

  .sidebar {
    border-right: 0;
    border-bottom: 1px solid rgba(148, 163, 184, 0.18);
  }

  .three-up,
  .two-col,
  .grid-two,
  .detail-grid,
  .stat-grid {
    grid-template-columns: 1fr;
  }

  .hero-card {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .content-area,
  .topbar {
    padding-left: 16px;
    padding-right: 16px;
  }

  .topbar {
    flex-wrap: wrap;
    height: auto;
    padding-top: 14px;
    padding-bottom: 14px;
    gap: 12px;
  }

  .search-box {
    width: 100%;
  }
}
