import React, { useState } from 'react';

export default function NotificationSettings() {
  const [enabled, setEnabled] = useState(true);
  const [muteTwitter, setMuteTwitter] = useState(false);
  const [muteInstagram, setMuteInstagram] = useState(false);

  return (
    <div className="settings-content">
      <h2>Notification Settings</h2>

      <div style={{ marginBottom: '1rem' }}>
        <label>
          <input
            type="checkbox"
            checked={enabled}
            onChange={() => setEnabled(!enabled)}
          />
          Enable All Notifications
        </label>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>
          <input
            type="checkbox"
            checked={muteTwitter}
            onChange={() => setMuteTwitter(!muteTwitter)}
          />
          Mute Twitter/X
        </label>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>
          <input
            type="checkbox"
            checked={muteInstagram}
            onChange={() => setMuteInstagram(!muteInstagram)}
          />
          Mute Instagram
        </label>
      </div>
    </div>
  );
}