import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../../assets/css/components.css';

export default function DropdownWide({
  options = [],
  value,
  onChange,
  style = {},
  className = '',
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const handleSelect = (val) => {
    onChange(val);
    setOpen(false);
  };

  return (
    <div
      className={`custom-dropdown-wrapper ${className}`}
      style={style}
      ref={containerRef}
    >
      <div className="custom-dropdown-header" onClick={() => setOpen(!open)}>
        {value}
        <span className="arrow">{open ? '▲' : '▼'}</span>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="custom-dropdown-list"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            {options.map((opt) => (
              <div
                key={opt}
                className={`custom-dropdown-item ${opt === value ? 'selected' : ''}`}
                onClick={() => handleSelect(opt)}
              >
                {opt}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}