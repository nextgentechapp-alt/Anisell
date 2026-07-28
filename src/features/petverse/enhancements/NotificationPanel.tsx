import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './NotificationPanel.module.css';

interface Notification {
  id: string;
  type: 'order' | 'promo' | 'price' | 'stock';
  title: string;
  message: string;
  icon: string;
  timestamp: number;
  read: boolean;
}

interface NotifPrefs {
  order: boolean;
  promo: boolean;
  price: boolean;
  stock: boolean;
}

const NOTIFS_KEY = 'pv_notifications';
const PREFS_KEY = 'pv_notif_prefs';

const SAMPLE_NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'order', title: 'Order Shipped', message: 'Your order #1042 has been shipped and is on its way!', icon: '📦', timestamp: Date.now() - 2 * 60 * 1000, read: false },
  { id: 'n2', type: 'promo', title: 'Weekend Sale', message: 'Flat 20% off on all accessories this weekend. Use code WEEKEND20', icon: '🏷️', timestamp: Date.now() - 15 * 60 * 1000, read: false },
  { id: 'n3', type: 'price', title: 'Price Drop', message: 'The Royal Canin kibble you viewed is now ₹200 cheaper!', icon: '📉', timestamp: Date.now() - 1 * 60 * 60 * 1000, read: false },
  { id: 'n4', type: 'stock', title: 'Back in Stock', message: 'Your favorite brand of wet cat food is now back in stock.', icon: '✅', timestamp: Date.now() - 2 * 60 * 60 * 1000, read: true },
  { id: 'n5', type: 'order', title: 'Order Delivered', message: 'Order #1035 has been delivered. Enjoy!', icon: '🎉', timestamp: Date.now() - 3 * 60 * 60 * 1000, read: false },
  { id: 'n6', type: 'promo', title: 'Referral Bonus Active', message: 'Refer a friend and earn 200pts each! Share your referral link now.', icon: '🔗', timestamp: Date.now() - 5 * 60 * 60 * 1000, read: true },
  { id: 'n7', type: 'price', title: 'Flash Deal', message: 'Limited time: Extra 15% off on premium pet food.', icon: '⚡', timestamp: Date.now() - 8 * 60 * 60 * 1000, read: false },
  { id: 'n8', type: 'order', title: 'Return Approved', message: 'Your return request for Order #1028 has been approved.', icon: '🔄', timestamp: Date.now() - 24 * 60 * 60 * 1000, read: true },
  { id: 'n9', type: 'stock', title: 'New Arrivals', message: 'New toys and grooming products just landed. Check them out!', icon: '🆕', timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000, read: true },
  { id: 'n10', type: 'promo', title: 'Birthday Reward', message: 'Happy Birthday! Enjoy a special 100pts bonus and 15% off your next order.', icon: '🎂', timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000, read: false },
];

const DEFAULT_PREFS: NotifPrefs = { order: true, promo: true, price: true, stock: true };

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  return `${Math.floor(day / 30)}mo ago`;
}

function loadNotifs(): Notification[] {
  try {
    const raw = localStorage.getItem(NOTIFS_KEY);
    if (raw) return JSON.parse(raw) as Notification[];
  } catch { /* ignore */ }
  return SAMPLE_NOTIFICATIONS;
}

function loadPrefs(): NotifPrefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return DEFAULT_PREFS;
}

export default function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(loadNotifs);
  const [prefs, setPrefs] = useState<NotifPrefs>(loadPrefs);
  const [tab, setTab] = useState<'all' | 'unread'>('all');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(NOTIFS_KEY, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  }, [prefs]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const filtered = tab === 'unread' ? notifications.filter(n => !n.read) : notifications;

  const handleOutsideClick = useCallback((e: MouseEvent) => {
    if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [open, handleOutsideClick]);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const toggleNotifRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const togglePref = (key: keyof NotifPrefs) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button className={styles.bellButton} onClick={() => setOpen(o => !o)}>
        🔔
        {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
      </button>

      {open && (
        <>
          <div className={styles.overlay} onClick={() => setOpen(false)} />
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>Notifications</span>
              <div className={styles.panelActions}>
                <button className={styles.actionBtn} onClick={markAllRead}>Mark all read</button>
                <button className={styles.actionBtn} onClick={clearAll}>Clear all</button>
              </div>
            </div>

            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${tab === 'all' ? styles.tabActive : ''}`}
                onClick={() => setTab('all')}
              >
                All ({notifications.length})
              </button>
              <button
                className={`${styles.tab} ${tab === 'unread' ? styles.tabActive : ''}`}
                onClick={() => setTab('unread')}
              >
                Unread ({unreadCount})
              </button>
            </div>

            <div className={styles.notifList}>
              {filtered.length === 0 ? (
                <div className={styles.emptyState}>No notifications</div>
              ) : (
                filtered.map(n => (
                  <div
                    key={n.id}
                    className={`${styles.notifItem} ${!n.read ? styles.notifUnread : ''}`}
                    onClick={() => toggleNotifRead(n.id)}
                  >
                    <span className={styles.notifIcon}>{n.icon}</span>
                    <div className={styles.notifContent}>
                      <div className={styles.notifTitle}>{n.title}</div>
                      <div className={styles.notifMessage}>{n.message}</div>
                      <div className={styles.notifFooter}>
                        <span className={styles.notifTime}>{relativeTime(n.timestamp)}</span>
                        {!n.read && <span className={styles.unreadDot} />}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className={styles.settingsHeader}>
              <span className={styles.settingsTitle}>Notification Preferences</span>
            </div>
            <div className={styles.settingsList}>
              {([
                { key: 'order' as const, label: 'Order Updates' },
                { key: 'promo' as const, label: 'Promotions' },
                { key: 'price' as const, label: 'Price Drops' },
                { key: 'stock' as const, label: 'Back in Stock' },
              ]).map(({ key, label }) => (
                <div key={key} className={styles.settingRow}>
                  <span>{label}</span>
                  <button
                    className={`${styles.toggle} ${prefs[key] ? styles.toggleActive : ''}`}
                    onClick={() => togglePref(key)}
                  >
                    <span className={styles.toggleKnob} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
