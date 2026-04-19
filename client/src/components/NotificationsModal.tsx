import { useEffect } from 'react';
import type { Notification } from '../pages/NotificationsScreen';
import './NotificationsModal.css';

interface Props {
  notifications: Notification[];
  onAccept: (notification: Notification) => void;
  onDismiss: (id: string) => void;
  onClose: () => void;
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

/**
 * Notifications drawer rendered as an overlay on top of the current screen,
 * so tapping the bell (or a toast) while in a battle / tournament doesn't
 * kick the user out of whatever they were doing. Only actions that
 * genuinely route somewhere else (Accept battle, Join tournament) will
 * leave the underlying screen.
 */
export default function NotificationsModal({ notifications, onAccept, onDismiss, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="notif-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Notifications">
      <div className="notif-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="notif-modal-header">
          <h2>Notifications</h2>
          <button className="notif-modal-close" aria-label="Close" onClick={onClose}>✕</button>
        </div>
        <div className="notif-modal-list">
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
    </div>
  );
}
