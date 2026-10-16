import React from 'react';

interface Finding {
  category: string;
  severity: string;
  class: string;
  method: string;
  offset: number;
  instruction: string;
  description: string;
}

interface CallGraphModalProps {
  finding: Finding | null;
  onClose: () => void;
}

export const CallGraphModal: React.FC<CallGraphModalProps> = ({ finding, onClose }) => {
  if (!finding) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(10, 20, 26, 0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        width: '680px',
        backgroundColor: '#142833',
        border: '1px solid #00e5ff',
        boxShadow: '0 0 25px rgba(0, 229, 255, 0.3)',
        borderRadius: '6px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 18px',
          backgroundColor: '#0f2027',
          borderBottom: '1px solid #2c5364',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#00e5ff', fontWeight: 700 }}>ИНТЕРАКТИВНЫЙ ГРАФ ВЫЗОВОВ</span>
            <span style={{
              fontSize: '11px',
              padding: '2px 6px',
              borderRadius: '3px',
              backgroundColor: finding.severity === 'CRITICAL' ? 'rgba(255,23,68,0.2)' : 'rgba(255,171,0,0.2)',
              color: finding.severity === 'CRITICAL' ? '#ff1744' : '#ffab00',
              fontWeight: 600,
            }}>
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
              fontSize: '18px',
              padding: '0 4px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Body / Graph Diagram */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: '13px', color: '#88a0b0' }}>
            Цепочка распространения скрытого вызова к точке компрометации:
          </div>

          {/* Node Visualizer */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            backgroundColor: '#0f2027',
            padding: '16px',
            borderRadius: '4px',
            border: '1px solid #2c5364',
          }}>
            {/* Step 1: Entry Trigger */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              backgroundColor: '#1b3542',
              borderRadius: '4px',
              borderLeft: '4px solid #00e5ff',
            }}>
              <div style={{ fontSize: '18px' }}>⚡</div>
              <div>
                <div style={{ fontSize: '11px', color: '#00e5ff', fontWeight: 600 }}>ENTRY POINT (TRIGGER)</div>
                <div style={{ fontSize: '13px', fontFamily: 'JetBrains Mono', color: '#e0f2f1' }}>
                  org.bukkit.event.player.AsyncPlayerChatEvent
                </div>
              </div>
            </div>

            {/* Arrow down */}
            <div style={{ display: 'flex', justifyContent: 'center', color: '#2c5364', fontSize: '16px' }}>
              ▼
            </div>

            {/* Step 2: Target Class / Method */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              backgroundColor: '#1b3542',
              borderRadius: '4px',
              borderLeft: '4px solid #ffab00',
            }}>
              <div style={{ fontSize: '18px' }}>🔍</div>
              <div>
                <div style={{ fontSize: '11px', color: '#ffab00', fontWeight: 600 }}>DISPATCHER & FILTER</div>
                <div style={{ fontSize: '13px', fontFamily: 'JetBrains Mono', color: '#e0f2f1' }}>
                  {finding.class}.{finding.method}
                </div>
                <div style={{ fontSize: '11px', color: '#88a0b0', marginTop: '2px' }}>
                  Проверка секретного токена / пароля в тексте сообщения
                </div>
              </div>
            </div>

            {/* Arrow down */}
            <div style={{ display: 'flex', justifyContent: 'center', color: '#2c5364', fontSize: '16px' }}>
              ▼
            </div>

            {/* Step 3: Malicious Sink */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              backgroundColor: 'rgba(255, 23, 68, 0.1)',
              borderRadius: '4px',
              borderLeft: '4px solid #ff1744',
            }}>
              <div style={{ fontSize: '18px' }}>💥</div>
              <div>
                <div style={{ fontSize: '11px', color: '#ff1744', fontWeight: 600 }}>VULNERABILITY SINK (OFFSET: {finding.offset})</div>
                <div style={{ fontSize: '13px', fontFamily: 'JetBrains Mono', color: '#ff5252' }}>
                  {finding.instruction}
                </div>
                <div style={{ fontSize: '11px', color: '#cfd8dc', marginTop: '2px' }}>
                  {finding.description}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          padding: '12px 18px',
          backgroundColor: '#0f2027',
          borderTop: '1px solid #2c5364',
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '6px 16px',
              backgroundColor: '#1b3542',
              border: '1px solid #2c5364',
              color: '#e0f2f1',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '12px',
            }}
          >
            ЗАКРЫТЬ
          </button>
        </div>
      </div>
    </div>
  );
};
