import React from 'react';

// Updated path: modules/settings/other/
const addonModules = import.meta.glob('./other/*.jsx', { eager: true });

const addons = Object.entries(addonModules).map(([path, mod]) => {
  const name = path
    .split('/')
    .pop()
    .replace('.jsx', '')
    .replace(/([a-z])([A-Z])/g, '$1 $2');

  return { name, Component: mod.default };
});

export default function OtherSettings() {
  return (
    <div className="settings-content">
      <h2>Other Settings</h2>
      {addons.length === 0 ? (
        <p>No add-ons detected.</p>
      ) : (
        addons.map(({ name, Component }) => (
          <div key={name} style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>{name}</h3>
            <Component />
          </div>
        ))
      )}
    </div>
  );
}
