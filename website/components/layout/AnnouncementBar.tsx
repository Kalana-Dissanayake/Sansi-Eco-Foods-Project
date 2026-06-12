'use client';

import { useState, useEffect } from 'react';

interface AnnouncementBarProps {
  enabled: boolean;
  text: string;
}

export default function AnnouncementBar({ enabled, text }: AnnouncementBarProps) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isDismissed = sessionStorage.getItem('announcement_dismissed');
    if (isDismissed) setDismissed(true);
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem('announcement_dismissed', 'true');
    setDismissed(true);
  };

  if (!enabled || dismissed) return null;

  return (
    <div
      style={{
        backgroundColor: 'var(--primary)',
        color: '#fff',
        padding: '10px 0',
        textAlign: 'center',
        fontSize: '14px',
        fontWeight: 500,
        position: 'relative',
        zIndex: 1100,
      }}
    >
      <span>{text}</span>
      <button
        onClick={handleDismiss}
        aria-label="Dismiss announcement"
        style={{
          position: 'absolute',
          right: '16px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          color: '#fff',
          cursor: 'pointer',
          fontSize: '18px',
          lineHeight: 1,
          padding: '0 4px',
          opacity: 0.8,
        }}
      >
        ×
      </button>
    </div>
  );
}
