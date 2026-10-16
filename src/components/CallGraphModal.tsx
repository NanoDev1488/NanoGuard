import React from 'react';
import { Finding } from './AuditView';

interface CallGraphModalProps {
  finding: Finding | null;
  onClose: () => void;
}

export const CallGraphModal: React.FC<CallGraphModalProps> = ({ finding, onClose }) => {
  if (!finding) return null;

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
          width: '720px',
          backgroundColor: '#0a151d',
          border: '1px solid #00e5ff',
          boxShadow: '0 0 30px rgba(0, 229, 255, 0.3)',
          borderRadius: '6px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Modal Header */}
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
            <span style={{ fontSize: '16px' }}>🌐</span>
            <span style={{ color: '#00e5ff', fontWeight: 800, fontSize: '13px', letterSpacing: '0.05em' }}>
              ИНТЕРАКТИВНЫЙ ГРАФ ВЫЗОВОВ (CALL FLOW GRAPH)
            </span>
            <span
              style={{
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '3px',
                backgroundColor: finding.severity === 'CRITICAL' ? 'rgba(255,23,68,0.2)' : 'rgba(255,171,0,0.2)',
                color: finding.severity === 'CRITICAL' ? '#ff1744' : '#ffab00',
                fontWeight: 800,
              }}
            >
              {finding.severity}
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

        {/* Modal Body / Graph Diagram */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ fontSize: '12px', color: '#90a4ae' }}>
            Цепочка передачи управления от внешнего триггера к точке компрометации сервера:
          </div>

          {/* Node Visualizer */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              backgroundColor: '#070f14',
              padding: '16px',
              borderRadius: '6px',
              border: '1px solid #1a3644',
            }}
          >
            {/* Step 1: Entry Point Trigger */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                backgroundColor: '#10222c',
                borderRadius: '4px',
                borderLeft: '4px solid #00e5ff',
              }}
            >
              <div style={{ fontSize: '20px' }}>⚡</div>
              <div>
                <div style={{ fontSize: '10px', color: '#00e5ff', fontWeight: 700 }}>
                  ENTRY POINT // ВНЕШНИЙ ТРИГГЕР
                </div>
                <div style={{ fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', color: '#e0f2f1' }}>
                  org.bukkit.event.player.AsyncPlayerChatEvent
                </div>
                <div style={{ fontSize: '10px', color: '#78909c', marginTop: '1px' }}>
                  Слушатель сообщений чата в потоке событий сервера
                </div>
              </div>
            </div>

            {/* Arrow down */}
            <div style={{ display: 'flex', justifyContent: 'center', color: '#2c5364', fontSize: '14px' }}>
              ▼
            </div>

            {/* Step 2: Target Class / Method */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                backgroundColor: '#10222c',
                borderRadius: '4px',
                borderLeft: '4px solid #ffab00',
              }}
            >
              <div style={{ fontSize: '20px' }}>🔍</div>
              <div>
                <div style={{ fontSize: '10px', color: '#ffab00', fontWeight: 700 }}>
                  DISPATCHER // ВАЛИДАЦИЯ ПАРОЛЯ
                </div>
                <div style={{ fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', color: '#e0f2f1' }}>
                  {finding.class}.{finding.method}
                </div>
                <div style={{ fontSize: '10px', color: '#78909c', marginTop: '1px' }}>
                  Сверка секретного хеша пароля из чата для активации бэкдора
                </div>
              </div>
            </div>

            {/* Arrow down */}
            <div style={{ display: 'flex', justifyContent: 'center', color: '#2c5364', fontSize: '14px' }}>
              ▼
            </div>

            {/* Step 3: Malicious Sink */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                backgroundColor: 'rgba(255, 23, 68, 0.12)',
                borderRadius: '4px',
                borderLeft: '4px solid #ff1744',
              }}
            >
              <div style={{ fontSize: '20px' }}>💥</div>
              <div>
                <div style={{ fontSize: '10px', color: '#ff1744', fontWeight: 700 }}>
                  MALICIOUS SINK // ТОЧКА КОМПРОМЕТАЦИИ [OFFSET: 0x{finding.offset.toString(16).toUpperCase()}]
                </div>
                <div style={{ fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', color: '#ff5252' }}>
                  {finding.instruction}
                </div>
                <div style={{ fontSize: '10px', color: '#cfd8dc', marginTop: '1px' }}>
                  {finding.description}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
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
              backgroundColor: '#12232c',
              border: '1px solid #1e3c4d',
              color: '#e0f2f1',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '11px',
            }}
          >
            ЗАКРЫТЬ
          </button>
        </div>
      </div>
    </div>
  );
};
