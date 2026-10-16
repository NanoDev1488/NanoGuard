import React from 'react';

interface TitlebarProps {
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
}

export const Titlebar: React.FC<TitlebarProps> = ({ onMinimize, onMaximize, onClose }) => {
  return (
    <div
      className="window-drag-region"
      style={{
        height: '38px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 12px',
        backgroundColor: '#070f14',
        borderBottom: '1px solid #1a3644',
        userSelect: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '16px', filter: 'drop-shadow(0 0 6px #00e5ff)' }}>🛡️</span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span style={{ fontWeight: 800, fontSize: '13px', letterSpacing: '0.12em', color: '#e0f2f1' }}>
            NANOGUARD
          </span>
          <span style={{ fontSize: '10px', color: '#00e5ff', fontWeight: 600, backgroundColor: 'rgba(0, 229, 255, 0.1)', padding: '1px 5px', borderRadius: '3px', border: '1px solid rgba(0, 229, 255, 0.3)' }}>
            v0.1.0
          </span>
        </div>
        <span style={{ fontSize: '10px', color: '#607d8b', marginLeft: '6px', fontFamily: 'JetBrains Mono, monospace' }}>
          [ NATIVE C++17 ARMOR & FASTSCAN ]
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: '#00e676', fontFamily: 'JetBrains Mono, monospace' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#00e676', boxShadow: '0 0 6px #00e676' }}></span>
          <span>SYSTEM READY</span>
        </div>

        {/* Window controls */}
        <div className="window-no-drag" style={{ display: 'flex', gap: '2px' }}>
          <button
            onClick={onMinimize}
            title="Свернуть"
            style={{
              background: 'none',
              border: 'none',
              color: '#88a0b0',
              padding: '4px 10px',
              cursor: 'pointer',
              fontSize: '12px',
              borderRadius: '3px',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#142833')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            —
          </button>
          <button
            onClick={onMaximize}
            title="Развернуть"
            style={{
              background: 'none',
              border: 'none',
              color: '#88a0b0',
              padding: '4px 10px',
              cursor: 'pointer',
              fontSize: '12px',
              borderRadius: '3px',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#142833')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            ▢
          </button>
          <button
            onClick={onClose}
            title="Закрыть"
            style={{
              background: 'none',
              border: 'none',
              color: '#88a0b0',
              padding: '4px 10px',
              cursor: 'pointer',
              fontSize: '13px',
              borderRadius: '3px',
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#ff1744';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#88a0b0';
            }}
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};
