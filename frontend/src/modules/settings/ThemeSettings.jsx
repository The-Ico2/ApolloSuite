import React from 'react';

const AVAILABLE_THEMES = ['default', 'solarized', 'hacker'];
const VARIANTS = ['light', 'dark', 'high-contrast'];

export default function ThemeSettings({ currentTheme, setCurrentTheme, currentVariant, setCurrentVariant }) {
  return (
    <div className="settings-content">
      {/* Theme Selector */}
      <label style={{ display: 'block', marginBottom: '0.5rem' }}>Choose Theme:</label>
      <select
        value={currentTheme}
        onChange={(e) => setCurrentTheme(e.target.value)}
        style={{
          padding: '0.5rem',
          borderRadius: '6px',
          border: '1px solid var(--border-color)',
          marginBottom: '1.5rem',
          background: 'var(--bg-color)',
          color: 'var(--text-color)',
        }}
      >
        {AVAILABLE_THEMES.map((theme) => (
          <option key={theme} value={theme}>
            {theme.charAt(0).toUpperCase() + theme.slice(1)}
          </option>
        ))}
      </select>

      {/* Variant Switcher */}
      <label style={{ display: 'block', marginBottom: '0.5rem' }}>Theme Variant:</label>
      <div style={{ display: 'flex', gap: '1rem' }}>
        {VARIANTS.map((variant) => (
          <button
            key={variant}
            onClick={() => setCurrentVariant(variant)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              background: currentVariant === variant ? 'var(--primary-color)' : 'transparent',
              color: 'var(--text-color)',
              fontWeight: currentVariant === variant ? 'bold' : 'normal',
              cursor: 'pointer',
            }}
          >
            {variant.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Optional: Upload theme */}
      <div style={{ marginTop: '2rem' }}>
        <label htmlFor="theme-upload">Upload custom theme (.css):</label>
        <input
          id="theme-upload"
          type="file"
          accept=".css"
          style={{ display: 'block', marginTop: '0.5rem' }}
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = () => {
                const blob = new Blob([reader.result], { type: 'text/css' });
                const url = URL.createObjectURL(blob);
                const themeName = file.name.replace('.css', '');
                const link = document.getElementById('theme-css');
                if (link) link.href = url;
                setCurrentTheme(themeName);
              };
              reader.readAsText(file);
            }
          }}
        />
      </div>
      <a
        href="/themes/global.css"
        download="global.css"
        style={{
          display: 'inline-block',
          marginTop: '1rem',
          padding: '0.5rem 1rem',
          backgroundColor: 'var(--primary-color)',
          color: 'var(--text-color)',
          borderRadius: '4px',
          textDecoration: 'none',
          fontWeight: 'bold',
          cursor: 'pointer',
        }}
      >
        Download Global Theme CSS
      </a>
    </div>
  );
}