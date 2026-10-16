import React, { useState } from 'react';

interface ConsoleViewProps {
  rawLog: string;
  onClear: () => void;
}

export const ConsoleView: React.FC<ConsoleViewProps> = ({ rawLog, onClear }) => {
  const [copied, setCopied] = useState(false);

  const defaultLines = [
    '[+] NanoGuard v0.1.0 initialized in OFFLINE mode.',
    '[+] Native C++17 bytecode streaming disassembler ready.',
    '[+] Rust FastScan multi-threaded engine loaded.',
    '[*] Waiting for JAR archive input...',
  ];

  const lines = rawLog ? rawLog.trim().split('\n') : defaultLines;

  const handleCopy = () => {
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLineColor = (line: string) => {
    if (line.startsWith('[!]') || line.includes('CRITICAL') || line.includes('Error')) return '#ff5252';
    if (line.startsWith('[+]') || line.includes('SUCCESS') || line.includes('CLEAN')) return '#00e676';
    if (line.startsWith('[*]')) return '#00e5ff';
    return '#cfd8dc';
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#070f14',
        border: '1px solid #1a3644',
        borderRadius: '6px',
        overflow: 'hidden',
      }}
    >
      {/* Console Top Toolbar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 14px',
          backgroundColor: '#0a151d',
          borderBottom: '1px solid #1a3644',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00e5ff' }}></span>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#e0f2f1', fontFamily: 'JetBrains Mono, monospace' }}>
            TERMINAL // NATIVE ENGINE STREAM
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleCopy}
            style={{
              padding: '4px 10px',
              backgroundColor: '#12232c',
              border: '1px solid #1e3c4d',
              color: '#80cbc4',
              borderRadius: '3px',
              fontSize: '10px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {copied ? '✓ Скопировано' : '📋 Копировать'}
          </button>
          <button
            onClick={onClear}
            style={{
              padding: '4px 10px',
              backgroundColor: 'transparent',
              border: '1px solid #263238',
              color: '#78909c',
              borderRadius: '3px',
              fontSize: '10px',
              cursor: 'pointer',
            }}
          >
            Очистить
          </button>
        </div>
      </div>

      {/* Console Output Area */}
      <div
        style={{
          flex: 1,
          padding: '12px 16px',
          overflowY: 'auto',
          fontFamily: 'JetBrains Mono, Consolas, monospace',
          fontSize: '11px',
          lineHeight: '1.6',
        }}
      >
        {lines.map((line, index) => (
          <div key={index} style={{ display: 'flex', gap: '12px' }}>
            <span style={{ color: '#37474f', userSelect: 'none', width: '28px', textAlign: 'right' }}>
              {index + 1}
            </span>
            <span style={{ color: getLineColor(line) }}>{line}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
