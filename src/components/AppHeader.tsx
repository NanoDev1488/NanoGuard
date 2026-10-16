import React from 'react';

export type TabType = 'audit' | 'protect' | 'console';

interface AppHeaderProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onOpenSettings: () => void;
  selectedJar: string | null;
  threatCount: number;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenSettings,
  selectedJar,
  threatCount,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 16px',
        backgroundColor: '#0a151d',
        borderBottom: '1px solid #1a3644',
      }}
    >
      {/* Navigation tabs */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => onTabChange('audit')}
          className="small-caps"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 16px',
            backgroundColor: activeTab === 'audit' ? '#132733' : 'transparent',
            border: activeTab === 'audit' ? '1px solid #00e5ff' : '1px solid transparent',
            color: activeTab === 'audit' ? '#00e5ff' : '#88a0b0',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: activeTab === 'audit' ? '0 0 12px rgba(0, 229, 255, 0.25)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <span>🛡️</span>
          <span>[ ʙᴀᴄᴋᴅᴏᴏʀ ʜᴜɴᴛᴇʀ ]</span>
          {threatCount > 0 && (
            <span
              style={{
                fontSize: '10px',
                padding: '1px 6px',
                borderRadius: '10px',
                backgroundColor: '#ff1744',
                color: '#fff',
                fontWeight: 800,
              }}
            >
              {threatCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onTabChange('protect')}
          className="small-caps"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 16px',
            backgroundColor: activeTab === 'protect' ? '#132733' : 'transparent',
            border: activeTab === 'protect' ? '1px solid #00e676' : '1px solid transparent',
            color: activeTab === 'protect' ? '#00e676' : '#88a0b0',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: activeTab === 'protect' ? '0 0 12px rgba(0, 230, 118, 0.25)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <span>🔒</span>
          <span>[ ʙʏᴛᴇᴄᴏᴅᴇ ᴀʀᴍᴏʀ ]</span>
        </button>

        <button
          onClick={() => onTabChange('console')}
          className="small-caps"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 16px',
            backgroundColor: activeTab === 'console' ? '#132733' : 'transparent',
            border: activeTab === 'console' ? '1px solid #ffab00' : '1px solid transparent',
            color: activeTab === 'console' ? '#ffab00' : '#88a0b0',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: activeTab === 'console' ? '0 0 12px rgba(255, 171, 0, 0.25)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <span>📟</span>
          <span>[ ʟɪᴠᴇ ᴄᴏɴꜱᴏʟᴇ ]</span>
        </button>
      </div>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {selectedJar && (
          <div
            style={{
              fontSize: '11px',
              fontFamily: 'JetBrains Mono, monospace',
              color: '#80cbc4',
              backgroundColor: '#10222c',
              padding: '4px 10px',
              borderRadius: '3px',
              border: '1px solid #1a3644',
              maxWidth: '220px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={selectedJar}
          >
            📦 {selectedJar.split(/[/\\]/).pop()}
          </div>
        )}

        <button
          onClick={onOpenSettings}
          className="small-caps"
          title="Настройки NanoGuard"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            backgroundColor: '#10222c',
            border: '1px solid #1a3644',
            color: '#b0bec5',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#00e5ff';
            e.currentTarget.style.color = '#00e5ff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#1a3644';
            e.currentTarget.style.color = '#b0bec5';
          }}
        >
          <span>⚙️</span>
          <span>[ ɴᴀꜱᴛʀᴏʏᴋɪ ]</span>
        </button>
      </div>
    </div>
  );
};
