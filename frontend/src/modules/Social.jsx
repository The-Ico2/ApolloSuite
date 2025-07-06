import React, { useState } from 'react';

// Reusable and styled platform chip
function PlatformChip({ name, connected, icon, onToggle }) {
  const statusColor = connected ? '#00e676' : '#ff1744';
  const statusText = connected ? 'Connected' : 'Not Connected';
  const buttonLabel = connected ? 'Disconnect' : 'Connect';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: '10px',
        width: '160px',
        padding: '14px',
        borderRadius: '12px',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: `1px solid ${statusColor}55`,
        boxShadow: connected
          ? `0 0 8px ${statusColor}88`
          : '0 0 4px rgba(255, 255, 255, 0.1)',
        color: '#fff',
        fontFamily: 'Segoe UI, Roboto, sans-serif',
        userSelect: 'none',
        transition: 'all 0.3s ease',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '1rem',
          fontWeight: 600,
          justifyContent: 'center',
        }}
      >
        {icon && (
          <img
            src={icon}
            alt={`${name} icon`}
            style={{ width: 20, height: 20, objectFit: 'contain' }}
          />
        )}
        <span>{name}</span>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          fontSize: '0.75rem',
          fontWeight: 500,
          color: statusColor,
          justifyContent: 'flex-start',
          gap: '6px',
        }}
      >
        <span>{statusText}</span>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: statusColor,
          }}
        />
      </div>

      <button
        onClick={onToggle}
        style={{
          padding: '6px 10px',
          borderRadius: '6px',
          border: `1px solid ${statusColor}`,
          backgroundColor: 'transparent',
          color: statusColor,
          fontSize: '0.75rem',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
        }}
      >
        {buttonLabel}
      </button>
    </div>
  );
}

export default function SocialMediaManager() {
  const [accounts, setAccounts] = useState([
    { id: 'tw', name: 'Twitter', connected: true, icon: '/icons/twitter.svg' },
    { id: 'ig', name: 'Instagram', connected: false, icon: '/icons/instagram.svg' },
    { id: 'fb', name: 'Facebook', connected: false, icon: '/icons/facebook.svg' },
  ]);

  const [postContent, setPostContent] = useState('');
  const [postHistory, setPostHistory] = useState([]);

  const handlePost = () => {
    if (!postContent.trim()) return alert("Post can't be empty!");
    setPostHistory(prev => [
      { id: Date.now(), content: postContent, date: new Date(), status: 'Published' },
      ...prev,
    ]);
    setPostContent('');
  };

  const toggleConnection = (id) => {
    setAccounts(prev =>
      prev.map(acc =>
        acc.id === id ? { ...acc, connected: !acc.connected } : acc
      )
    );
  };

  return (
    <div
      style={{
        padding: '2rem',
        color: 'white',
        fontFamily: 'Segoe UI, Roboto, sans-serif',
        maxWidth: '900px',
        margin: '0 auto',
      }}
    >
      <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Social Media Manager</h2>

      <section>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Connected Platforms</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          {accounts.map(acc => (
            <PlatformChip
              key={acc.id}
              name={acc.name}
              connected={acc.connected}
              icon={acc.icon}
              onToggle={() => toggleConnection(acc.id)}
            />
          ))}
        </div>
      </section>

      <section style={{ marginTop: '2.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Create Post</h3>
        <textarea
          rows={4}
          placeholder="What's on your mind?"
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          style={{
            width: '100%',
            padding: '1rem',
            borderRadius: '8px',
            backgroundColor: '#222',
            color: 'white',
            fontSize: '1rem',
            border: '1px solid #444',
            resize: 'vertical',
          }}
        />
        <button
          onClick={handlePost}
          style={{
            marginTop: '1rem',
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#00e676',
            color: '#000',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '1rem',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          }}
        >
          Post Now
        </button>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Post History</h3>
        {postHistory.length === 0 ? (
          <p style={{ color: '#aaa' }}>No posts yet.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {postHistory.map(post => (
              <li
                key={post.id}
                style={{
                  backgroundColor: '#1f1f1f',
                  borderLeft: '4px solid #00e676',
                  padding: '1rem',
                  borderRadius: '6px',
                  marginBottom: '1rem',
                }}
              >
                <div style={{ fontWeight: 600 }}>{post.content}</div>
                <div
                  style={{
                    marginTop: '0.25rem',
                    fontSize: '0.85rem',
                    color: '#aaa',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>{post.date.toLocaleString()}</span>
                  <span style={{ color: '#00e676', fontWeight: 500 }}>{post.status}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
