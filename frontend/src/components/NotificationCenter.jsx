import React, { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { FaTwitter, FaInstagram, FaFacebookF, FaExclamationTriangle } from 'react-icons/fa';

const APP_ICONS = {
  twitter: <FaTwitter color="#1DA1F2" />,
  instagram: <FaInstagram color="#C13584" />,
  facebook: <FaFacebookF color="#1877F2" />,
};

function groupNotifications(notifications) {
  return notifications.reduce((groups, notif) => {
    if (!groups[notif.app]) groups[notif.app] = [];
    groups[notif.app].push(notif);
    return groups;
  }, {});
}

function timeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
}

export default function NotificationCenter() {
  const { data: notifications = [], isLoading, error } = useNotifications();
  const grouped = groupNotifications(notifications);
  const [expandedApps, setExpandedApps] = useState({});

  const toggleExpand = (app) => {
    setExpandedApps((prev) => ({ ...prev, [app]: !prev[app] }));
  };

  return (
    <div
      style={{
        width: '350px',
        background: 'var(--sidebar-bg)',
        color: 'var(--text-color)',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
        padding: '1rem',
        fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <h3 style={{ margin: 0, fontWeight: '600' }}>Social Media Notifications</h3>

      {isLoading && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '4px solid var(--primary-color)',
              borderTop: '4px solid transparent',
              borderRadius: '50%',
              margin: '0 auto',
              animation: 'spin 1s linear infinite',
            }}
          />
          <p style={{ marginTop: '1rem', fontSize: '0.9rem', opacity: 0.7 }}>Loading...</p>
        </div>
      )}

      {error && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <FaExclamationTriangle size={36} color="red" style={{ animation: 'pulse 1s infinite' }} />
          <p style={{ marginTop: '1rem', fontSize: '0.9rem', opacity: 0.7 }}>Failed to load notifications.</p>
        </div>
      )}

      {!isLoading && !error &&
        Object.entries(grouped).map(([app, notifs]) => {
          const sorted = [...notifs].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          const isExpanded = expandedApps[app];

          return (
            <div
              key={app}
              style={{
                marginBottom: '1rem',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                overflow: 'hidden',
              }}
            >
              <button
                onClick={() => toggleExpand(app)}
                aria-expanded={isExpanded}
                aria-controls={`notif-list-${app}`}
                style={{
                  width: '100%',
                  background: 'var(--primary-color)',
                  border: 'none',
                  color: 'var(--text-color)',
                  padding: '0.75rem 1rem',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  userSelect: 'none',
                }}
              >
                <span>{APP_ICONS[app] || '📱'}</span>
                <span style={{ textTransform: 'capitalize' }}>{app}</span>
                <span
                  style={{
                    marginLeft: 'auto',
                    fontWeight: 'normal',
                    fontSize: '0.85rem',
                    opacity: 0.85,
                  }}
                >
                  {notifs.length} notification{notifs.length !== 1 ? 's' : ''}
                </span>
                <span>{isExpanded ? '▲' : '▼'}</span>
              </button>

              {isExpanded && (
                <ul
                  id={`notif-list-${app}`}
                  style={{
                    listStyle: 'none',
                    margin: 0,
                    padding: '0.5rem 1rem',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    background: 'var(--bg-color)',
                    color: 'var(--text-color)',
                    animation: 'fadeIn 0.3s ease-out',
                  }}
                >
                  {sorted.map((notif) => (
                    <li
                      key={notif.id}
                      style={{
                        padding: '0.5rem 0',
                        borderBottom: '1px solid var(--border-color)',
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>{notif.message}</span>
                      <time
                        style={{ opacity: 0.7, fontSize: '0.8rem' }}
                        dateTime={notif.createdAt}
                      >
                        {timeAgo(notif.createdAt)}
                      </time>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
    </div>
  );
}