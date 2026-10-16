import React from 'react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
}

interface ToastsProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toasts: React.FC<ToastsProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'success':
        return { border: '#00e676', color: '#00e676', icon: '✓' };
      case 'error':
        return { border: '#ff1744', color: '#ff1744', icon: '✕' };
      case 'warning':
        return { border: '#ffab00', color: '#ffab00', icon: '⚠' };
      default:
        return { border: '#00e5ff', color: '#00e5ff', icon: 'ℹ' };
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '36px',
        right: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 200,
      }}
    >
      {toasts.map((t) => {
        const style = getTypeStyle(t.type);
        return (
          <div
            key={t.id}
            onClick={() => onDismiss(t.id)}
            style={{
              backgroundColor: '#0a151d',
              border: `1px solid ${style.border}`,
              borderLeft: `4px solid ${style.border}`,
              boxShadow: `0 4px 16px rgba(0,0,0,0.5)`,
              borderRadius: '4px',
              padding: '10px 14px',
              minWidth: '260px',
              maxWidth: '380px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            <span style={{ color: style.color, fontWeight: 800, fontSize: '14px' }}>{style.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#e0f2f1' }}>{t.title}</div>
              <div style={{ fontSize: '11px', color: '#90a4ae', marginTop: '2px' }}>{t.message}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
