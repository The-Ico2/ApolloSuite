import React from 'react';

export default function TabNavigation({ tabs, activeTab, setActiveTab }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem'}}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '6px 6px 0px 0px',
            border: activeTab === tab.key ? '1px var(--primary-color) solid' : '1px var(--border-color) solid',
            background: activeTab === tab.key ? 'var(--primary-color)' : 'transparent',
            color: activeTab === tab.key ? 'black' : 'var(--text-color)',
            fontWeight: activeTab === tab.key ? 'bold' : 'normal',
            cursor: 'pointer',
            transition: '0.2s ease',
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}