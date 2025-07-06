import React, { useState } from 'react';

export default function AdvancedSettings() {
  const [developerMode, setDeveloperMode] = useState(false);
  const [logOutput, setLogOutput] = useState(true);
  const [experimentalFeatures, setExperimentalFeatures] = useState(false);

  return (
    <div className="settings-content">
      <h2>Advanced Settings</h2>

      <div style={{ marginBottom: '1rem' }}>
        <label>
          <input
            type="checkbox"
            checked={developerMode}
            onChange={() => setDeveloperMode(!developerMode)}
          />
          Enable Developer Mode
        </label>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>
          <input
            type="checkbox"
            checked={logOutput}
            onChange={() => setLogOutput(!logOutput)}
          />
          Enable Console Logging
        </label>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>
          <input
            type="checkbox"
            checked={experimentalFeatures}
            onChange={() => setExperimentalFeatures(!experimentalFeatures)}
          />
          Enable Experimental Features
        </label>
      </div>
    </div>
  );
}
