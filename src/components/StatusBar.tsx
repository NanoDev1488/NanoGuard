import React from 'react';

interface StatusBarProps {
  cpu: string;
  ram: string;
  telemetry: string;
  engine: 'cpp' | 'rust';
}

export const StatusBar: React.FC<StatusBarProps> = ({ cpu, ram, telemetry, engine }) => {
  return (
    <div
      style={{
        height: '26px',
        backgroundColor: '#070f14',
        borderTop: '1px solid #1a3644',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 14px',
        fontSize: '11px',
        fontFamily: 'JetBrains Mono, monospace',
        userSelect: 'none',
      }}
    >
      <div style={{ display: 'flex', gap: '16px', color: '#78909c' }}>
        <span>
          CPU: <span style={{ color: '#00e676', fontWeight: 600 }}>{cpu}</span>
        </span>
        <span>
          RAM: <span style={{ color: '#00e5ff', fontWeight: 600 }}>{ram}</span>
        </span>
        <span style={{ color: '#80cbc4' }}>
          {telemetry}
        </span>
        <span style={{ color: '#607d8b' }}>
          ENGINE: <span style={{ color: engine === 'cpp' ? '#00e5ff' : '#00e676' }}>{engine.toUpperCase()} NATIVE</span>
        </span>
      </div>

      <div style={{ color: '#546e7a', display: 'flex', gap: '8px' }}>
        <span>NanoDev</span>
        <span>·</span>
        <a
          href="https://t.me/WineSquad"
          target="_blank"
          rel="noreferrer"
          style={{ color: '#80cbc4', textDecoration: 'none' }}
        >
          t.me/WineSquad
        </a>
      </div>
    </div>
  );
};
