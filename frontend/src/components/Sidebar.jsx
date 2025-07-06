import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiHome,
  FiCloud,
  FiShare2,
  FiBookOpen,
  FiSun,
  FiMoon,
  FiEye,
  FiSettings
} from 'react-icons/fi';

const VARIANTS = ['light', 'dark', 'high-contrast'];

export default function Sidebar({ position = 'left', currentVariant, setVariant }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const nextVariant = () => {
    const i = VARIANTS.indexOf(currentVariant);
    const next = VARIANTS[(i + 1) % VARIANTS.length];
    setVariant(next);
  };

  return (
    <div className={`sidebar sidebar-${position}`}>
      <div className="dock-icons">
        <NavLink to="/" title="Dashboard"><FiHome /></NavLink>
        <NavLink to="/social" title="Social"><FiShare2 /></NavLink>
        <NavLink to="/storage" title="Storage"><FiCloud /></NavLink>
        <NavLink to="/obsidian" title="Obsidian"><FiBookOpen /></NavLink>
        <NavLink to="/settings" title="Settings"><FiSettings /></NavLink>
      </div>

      <div className="dock-footer">
        <button title="Toggle Theme Variant" onClick={nextVariant}>
          {currentVariant === 'dark' ? <FiSun /> :
           currentVariant === 'light' ? <FiEye /> :
           <FiMoon />}
        </button>
        <div className="dock-clock">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
      </div>
    </div>
  );
}