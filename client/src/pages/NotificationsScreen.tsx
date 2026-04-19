import { useNavigate } from 'react-router-dom';
import './NotificationsScreen.css';

export interface Notification {
  id: string;
  type: 'battle' | 'trade' | 'tournament' | 'announcement';
  from: string;
  timestamp: number;
  /** For 'announcement' notifications: the admin-supplied body text. */
  message?: string;
}

interface NotificationsScreenProps {
  notifications: Notification[];
  onAccept: (notification: Notification) => void;
  onDismiss: (id: string) => void;
}

const TYPE_LABELS: Record<Notification['type'], { icon: string; label: string }> = {
  battle: { icon: '⚔️', label: 'Battle challenge' },
  trade: { icon: '🔄', label: 'Trade request' },
  tournament: { icon: '🏆', label: 'Tournament' },
  announcement: { icon: '📣', label: 'Announcement' },
};

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export default function NotificationsScreen({ notifications, onAccept, onDismiss }: NotificationsScreenProps) {
  const navigate = useNavigate();

  return (
    <div className="notif-screen">
      <div className="notif-header">
        <button className="notif-back" onClick={() => navigate('/play')}>← Back</button>
        <h2>Notifications</h2>
      </div>
      <div className="notif-list">
        {notifications.length === 0 && (
          <div className="notif-empty">
            <div className="notif-empty-icon">🔔</div>
            <div>No notifications</div>
          </div>
        )}
        {notifications.map((n) => {
          const { icon, label } = TYPE_LABELS[n.type];
          if (n.type === 'announcement') {
            return (
              <div key={n.id} className="notif-card notif-card-announcement">
                <div className="notif-card-icon">{icon}</div>
                <div className="notif-card-body">
                  <div className="notif-card-text">
                    <strong>{n.from || label}</strong>
                  </div>
                  {n.message && <div className="notif-card-message">{n.message}</div>}
                  <div className="notif-card-time">{timeAgo(n.timestamp)}</div>
                </div>
                <div className="notif-card-actions">
                  <button className="ds-btn ds-btn-primary ds-btn-sm" onClick={() => onDismiss(n.id)}>
                    Acknowledge
                  </button>
                </div>
              </div>
            );
          }
          return (
            <div key={n.id} className="notif-card">
              <div className="notif-card-icon">{icon}</div>
              <div className="notif-card-body">
                <div className="notif-card-text">
                  <strong>{n.from}</strong> — {label}
                </div>
                <div className="notif-card-time">{timeAgo(n.timestamp)}</div>
              </div>
              <div className="notif-card-actions">
                <button className="ds-btn ds-btn-primary ds-btn-sm" onClick={() => onAccept(n)}>Accept</button>
                <button className="ds-btn ds-btn-ghost ds-btn-sm ds-btn-icon" aria-label="Dismiss" onClick={() => onDismiss(n.id)}>✕</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
