import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../../assets/css/NotificationSettings.css';

const platforms = ['All', 'Twitter', 'Instagram', 'Discord'];

export default function NotificationSettings() {
  const [selectedPlatform, setSelectedPlatform] = useState('All');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [globalSettings, setGlobalSettings] = useState({
    enabled: true,
  });

  const [platformSettings, setPlatformSettings] = useState({
    Twitter: { mute: false, push: true },
    Instagram: { mute: true, push: false },
    Discord: { mute: false, push: true },
  });

  const togglePlatformSetting = (platform, key) => {
    setPlatformSettings((prev) => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [key]: !prev[platform][key],
      },
    }));
  };

  const toggleGlobalSetting = (key) => {
    setGlobalSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="settings-content">
      <div className="custom-dropdown-wrapper">
        <div
          className="custom-dropdown-header"
          onClick={() => setDropdownOpen((prev) => !prev)}
        >
          {selectedPlatform}
          <span className="arrow">{dropdownOpen ? '▲' : '▼'}</span>
        </div>

        <AnimatePresence>
          {dropdownOpen && (
            <motion.div
              className="custom-dropdown-list"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              {platforms.map((platform) => (
                <div
                  key={platform}
                  className={`custom-dropdown-item ${
                    platform === selectedPlatform ? 'selected' : ''
                  }`}
                  onClick={() => {
                    setSelectedPlatform(platform);
                    setDropdownOpen(false);
                  }}
                >
                  {platform}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedPlatform}
          className="settings-group"
          initial={{ opacity: 0}}
          animate={{ opacity: 1}}
          exit={{ opacity: 0}}
          transition={{ duration: 0.3 }}
        >
          {selectedPlatform === 'All' ? (
            <label>
              <input
                type="checkbox"
                checked={globalSettings.enabled}
                onChange={() => toggleGlobalSetting('enabled')}
              />
              Enable All Notifications
            </label>
          ) : (
            <>
              <label>
                <input
                  type="checkbox"
                  checked={platformSettings[selectedPlatform]?.mute || false}
                  onChange={() =>
                    togglePlatformSetting(selectedPlatform, 'mute')
                  }
                />
                Mute {selectedPlatform}
              </label>
              <br />
              <label>
                <input
                  type="checkbox"
                  checked={platformSettings[selectedPlatform]?.push || false}
                  onChange={() =>
                    togglePlatformSetting(selectedPlatform, 'push')
                  }
                />
                Push Notifications
              </label>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}