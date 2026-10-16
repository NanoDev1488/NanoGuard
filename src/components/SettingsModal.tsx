import React from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  engine: 'cpp' | 'rust';
  setEngine: (eng: 'cpp' | 'rust') => void;
  threads: number;
  setThreads: (t: number) => void;
  autoOpen: boolean;
  setAutoOpen: (v: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  engine,
  setEngine,
  threads,
  setThreads,
  autoOpen,
  setAutoOpen,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(5, 12, 16, 0.88)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        backdropFilter: 'blur(5px)',
      }}
    >
      <div
        style={{
          width: '560px',
          backgroundColor: '#0a151d',
          border: '1px solid #1a3644',
          boxShadow: '0 0 25px rgba(0, 229, 255, 0.2)',
          borderRadius: '6px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 18px',
            backgroundColor: '#070f14',
            borderBottom: '1px solid #1a3644',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '15px' }}>⚙️</span>
            <span style={{ color: '#00e5ff', fontWeight: 800, fontSize: '13px', letterSpacing: '0.05em' }}>
              НАСТРОЙКИ NANOGUARD
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#88a0b0',
              cursor: 'pointer',
              fontSize: '16px',
              padding: '0 4px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Engine Selector */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#e0f2f1', marginBottom: '6px' }}>
              ДВИЖОК СТАТИЧЕСКОГО АНАЛИЗА
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div
                onClick={() => setEngine('cpp')}
                style={{
                  padding: '10px',
                  backgroundColor: engine === 'cpp' ? '#142a36' : '#0d1c24',
                  border: engine === 'cpp' ? '1px solid #00e5ff' : '1px solid #1a3644',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 700, color: engine === 'cpp' ? '#00e5ff' : '#cfd8dc' }}>
                  C++17 Streaming Parser
                </div>
                <div style={{ fontSize: '10px', color: '#78909c', marginTop: '2px' }}>
                  Потоковый разбор опкодов и построение CFG
                </div>
              </div>

              <div
                onClick={() => setEngine('rust')}
                style={{
                  padding: '10px',
                  backgroundColor: engine === 'rust' ? '#142a36' : '#0d1c24',
                  border: engine === 'rust' ? '1px solid #00e676' : '1px solid #1a3644',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 700, color: engine === 'rust' ? '#00e676' : '#cfd8dc' }}>
                  Rust FastScan Core
                </div>
                <div style={{ fontSize: '10px', color: '#78909c', marginTop: '2px' }}>
                  Параллельный сканер Rayon + энтропия Шеннона
                </div>
              </div>
            </div>
          </div>

          {/* Threads */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#e0f2f1' }}>ПОТОКИ СКАНИРОВАНИЯ (RAYON WORKERS)</span>
              <span style={{ fontSize: '12px', color: '#00e5ff', fontFamily: 'JetBrains Mono, monospace' }}>{threads}</span>
            </div>
            <input
              type="range"
              min={1}
              max={8}
              value={threads}
              onChange={(e) => setThreads(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#00e5ff' }}
            />
          </div>

          {/* Auto open toggle */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={autoOpen}
              onChange={(e) => setAutoOpen(e.target.checked)}
              style={{ accentColor: '#00e676' }}
            />
            <span style={{ fontSize: '12px', color: '#cfd8dc' }}>
              Автоматически открывать папку в проводнике после защиты плагина
            </span>
          </label>

          {/* About section */}
          <div
            style={{
              marginTop: '6px',
              padding: '12px',
              backgroundColor: '#070f14',
              borderRadius: '4px',
              border: '1px solid #1a3644',
              fontSize: '11px',
              color: '#78909c',
              lineHeight: '1.6',
            }}
          >
            <div><strong style={{ color: '#e0f2f1' }}>NanoGuard v0.1.0</strong> — Native Bytecode Armor & Backdoor Hunter.</div>
            <div>Брат-близнец NanoDecompiler для Spigot, Paper и Velocity серверов.</div>
            <div style={{ marginTop: '4px' }}>
              Разработчик: <a href="https://t.me/WineSquad" target="_blank" rel="noreferrer" style={{ color: '#00e5ff', textDecoration: 'none' }}>NanoDev (t.me/WineSquad)</a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '12px 18px',
            backgroundColor: '#070f14',
            borderTop: '1px solid #1a3644',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '6px 18px',
              backgroundColor: '#00e5ff',
              border: 'none',
              color: '#070f14',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '11px',
            }}
          >
            СОХРАНИТЬ
          </button>
        </div>
      </div>
    </div>
  );
};
