import { useNotifications } from '../hooks/useNotifications';

export default function NotificationsPage() {
  const { notifications, unreadCount, loading, error, markAsRead, deleteNotif } = useNotifications();

  return (
    <div className="page-stack">
      <section className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <p className="eyebrow">Updates</p>
            <h1>Notifications</h1>
          </div>
          {unreadCount > 0 && <span className="pill">{unreadCount} unread</span>}
        </div>

        {error && <p className="muted" style={{ color: 'red' }}>Error: {error}</p>}
        {loading && <p className="muted">Loading notifications...</p>}
        {!loading && notifications.length === 0 && <p>No notifications.</p>}
        {!loading && notifications.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {notifications.map((notif) => (
              <div
                key={notif.id}
                style={{
                  padding: 12,
                  borderRadius: 8,
                  background: notif.read ? 'rgba(148,163,184,0.08)' : 'rgba(59,130,246,0.12)',
                  borderLeft: notif.read ? 'none' : '4px solid #3b82f6',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <strong>{notif.title}</strong>
                  <p style={{ margin: '4px 0 0', color: '#a9b9d0', fontSize: '0.9rem' }}>{notif.message}</p>
                  <small style={{ color: '#8eb6ff' }}>{new Date(notif.createdAt).toLocaleString()}</small>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {!notif.read && (
                    <button
                      className="secondary-button"
                      onClick={() => markAsRead(notif.id)}
                      style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                    >
                      Mark read
                    </button>
                  )}
                  <button
                    className="secondary-button"
                    onClick={() => deleteNotif(notif.id)}
                    style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
