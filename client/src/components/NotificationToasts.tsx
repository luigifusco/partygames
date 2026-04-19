import { useEffect, useRef, useState } from 'react';
import type { Notification } from '../pages/NotificationsScreen';
import './NotificationToasts.css';

interface Toast {
  id: string;
  type: Notification['type'];
  from: string;
  message?: string;
  createdAt: number;
}

const TOAST_DURATION_MS = 5200;
const TOAST_DURATION_ANNOUNCEMENT_MS = 8000;

const TYPE_META: Record<Notification['type'], { icon: string; label: string }> = {
  battle: { icon: '⚔️', label: 'Battle challenge' },
  trade: { icon: '🔄', label: 'Trade request' },
  tournament: { icon: '🏆', label: 'Tournament' },
  announcement: { icon: '📣', label: 'Announcement' },
};

interface Props {
  notifications: Notification[];
  onOpen?: (notification: Notification) => void;
}

/**
 * Renders transient toast notifications at the top of the viewport for every
 * new Notification that arrives. Old notifications already in the list when
 * this component mounts are marked as "seen" immediately and do not toast —
 * only fresh arrivals do.
 */
export default function NotificationToasts({ notifications, onOpen }: Props) {
  const seenRef = useRef<Set<string>>(new Set());
  const mountedRef = useRef(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    // On first render, treat everything already in the list as "seen" so we
    // don't toast a backlog of battle/trade requests the user already has.
    if (!mountedRef.current) {
      mountedRef.current = true;
      for (const n of notifications) seenRef.current.add(n.id);
      return;
    }

    const fresh: Toast[] = [];
    for (const n of notifications) {
      if (seenRef.current.has(n.id)) continue;
      seenRef.current.add(n.id);
      fresh.push({
        id: n.id,
        type: n.type,
        from: n.from,
        message: n.message,
        createdAt: Date.now(),
      });
    }
    if (fresh.length === 0) return;

    setToasts((prev) => [...prev, ...fresh]);

    const timers = fresh.map((t) => {
      const ttl = t.type === 'announcement' ? TOAST_DURATION_ANNOUNCEMENT_MS : TOAST_DURATION_MS;
      return window.setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== t.id));
      }, ttl);
    });

    return () => {
      for (const id of timers) window.clearTimeout(id);
    };
  }, [notifications]);

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleClick = (toast: Toast) => {
    const n = notifications.find((x) => x.id === toast.id);
    if (n && onOpen) onOpen(n);
    dismiss(toast.id);
  };

  if (toasts.length === 0) return null;

  return (
    <div className="notif-toast-stack" role="region" aria-live="polite" aria-label="Notifications">
      {toasts.map((t) => {
        const meta = TYPE_META[t.type];
        return (
          <div
            key={t.id}
            className={`notif-toast notif-toast-${t.type}`}
            onClick={() => handleClick(t)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(t); }}
          >
            <span className="notif-toast-icon">{meta.icon}</span>
            <div className="notif-toast-body">
              <div className="notif-toast-title">
                <strong>{t.from || meta.label}</strong>
                {t.type !== 'announcement' && <span className="notif-toast-label"> — {meta.label}</span>}
              </div>
              {t.message && <div className="notif-toast-message">{t.message}</div>}
            </div>
            <button
              className="notif-toast-close"
              aria-label="Dismiss"
              onClick={(e) => { e.stopPropagation(); dismiss(t.id); }}
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
