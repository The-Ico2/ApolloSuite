import React, { useEffect } from 'react';
import { useAppearance } from '../../context/AppearanceContext';

export default function AppearanceSettings() {
  const {
    dockPosition,
    setDockPosition,
    fontSize,
    setFontSize,
    animationsEnabled,
    setAnimationsEnabled,
  } = useAppearance();

  // Sync dock position with localStorage and CSS variable
  useEffect(() => {
    if (dockPosition) {
      document.documentElement.style.setProperty('--dock-position', dockPosition);
      localStorage.setItem('dockPosition', dockPosition);
    }
  }, [dockPosition]);

  // Sync font size and animations
  useEffect(() => {
    document.documentElement.setAttribute('data-font-size', fontSize || 'medium');
    localStorage.setItem('fontSize', fontSize || 'medium');
  }, [fontSize]);

  useEffect(() => {
    document.body.classList.toggle('no-animations', !animationsEnabled);
    localStorage.setItem('animationsEnabled', animationsEnabled ? 'true' : 'false');
  }, [animationsEnabled]);

  return (
    <div className="settings-content">
      <h2>Appearance Settings</h2>

      <label style={{ display: 'block', margin: '1rem 0 0.5rem' }}>Dock Position:</label>
      <select
        value={dockPosition}
        onChange={(e) => setDockPosition(e.target.value)}
        style={{ padding: '0.5rem', borderRadius: '6px' }}
      >
        <option value="left">Left</option>
        <option value="right">Right</option>
        <option value="top">Top</option>
        <option value="bottom">Bottom</option>
      </select>

      <label style={{ display: 'block', margin: '1rem 0 0.5rem' }}>Font Size:</label>
      <select
        value={fontSize}
        onChange={(e) => setFontSize(e.target.value)}
        style={{ padding: '0.5rem', borderRadius: '6px' }}
      >
        <option value="small">Small</option>
        <option value="medium">Medium (default)</option>
        <option value="large">Large</option>
      </select>

      <div style={{ marginTop: '1rem' }}>
        <label>
          <input
            type="checkbox"
            checked={animationsEnabled}
            onChange={() => setAnimationsEnabled(!animationsEnabled)}
          />{' '}
          Enable UI Animations
        </label>
      </div>
    </div>
  );
}