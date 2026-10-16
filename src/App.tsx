import React, { useState, useEffect } from 'react';
import { AuditTab } from './components/AuditTab';
import { ProtectTab } from './components/ProtectTab';

interface SystemStats {
  cpu: string;
  ram: string;
  telemetry: string;
}

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'audit' | 'protect'>('audit');
  const [selectedJar, setSelectedJar] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [auditReport, setAuditReport] = useState<any>(null);
  const [rawLog, setRawLog] = useState<string>('');
  const [stats, setStats] = useState<SystemStats>({
    cpu: '1.2%',
    ram: '38 MB',
    telemetry: '0% TELEMETRY (OFFLINE)',
  });

  useEffect(() => {
    // Poll stats from backend
    const interval = setInterval(async () => {
      // @ts-ignore
      if (window.nanoGuardAPI?.getSystemStats) {
        // @ts-ignore
        const s = await window.nanoGuardAPI.getSystemStats();
        if (s) setStats(s);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectFile = async () => {
    // @ts-ignore
    if (window.nanoGuardAPI?.selectJarFile) {
      // @ts-ignore
      const path = await window.nanoGuardAPI.selectJarFile();
      if (path) {
        setSelectedJar(path);
        setAuditReport(null);
      }
    } else {
      // Browser fallback for testing
      const fakePath = 'C:\\Plugins\\suspect_plugin.jar';
      setSelectedJar(fakePath);
      setAuditReport(null);
    }
  };

  const handleScan = async () => {
    if (!selectedJar) return;
    setScanning(true);
    setAuditReport(null);
    setRawLog('');

    try {
      // @ts-ignore
      if (window.nanoGuardAPI?.auditJar) {
        // @ts-ignore
        const res = await window.nanoGuardAPI.auditJar(selectedJar);
        setAuditReport(res.report);
        setRawLog(res.rawLog);
      } else {
        // Mock fallback
        setTimeout(() => {
          setAuditReport({
            target: selectedJar,
            total_classes: 18,
            obfuscator: 'Zelix KlassMaster / Stringer',
            danger_score: 90,
            findings: [
              {
                category: 'ForceOP / Backdoor Hijack',
                severity: 'CRITICAL',
                class: 'com/plugin/listener/ChatHook',
                method: 'onChat(AsyncPlayerChatEvent)V',
                offset: 1186,
                instruction: '0x04A2: invokevirtual org/bukkit/entity/Player.setOp(Z)',
                description: 'Скрытая выдача прав оператора игроку при вводе триггера в чат.',
              },
              {
                category: 'Remote Payload Download (Dropper)',
                severity: 'CRITICAL',
                class: 'com/plugin/core/UpdateCheck',
                method: 'loadRemote()V',
                offset: 512,
                instruction: '0x0200: new java/net/URLClassLoader',
                description: 'Динамическая загрузка вредоносного байткода из сети.',
              },
            ],
          });
          setRawLog('[+] Scanned 18 classes.\n[+] Found 2 critical vulnerabilities.\n');
          setScanning(false);
        }, 1200);
        return;
      }
    } catch (e) {
      console.error(e);
    } finally {
      setScanning(false);
    }
  };

  const handleWindowControl = (action: 'minimize' | 'maximize' | 'close') => {
    // @ts-ignore
    window.nanoGuardAPI?.windowControl(action);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: '#0f2027',
      color: '#e0f2f1',
      border: '1px solid #2c5364',
    }}>
      {/* Custom Title Bar */}
      <div
        className="window-drag-region"
        style={{
          height: '38px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 12px',
          backgroundColor: '#0b181d',
          borderBottom: '1px solid #2c5364',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#00e5ff', fontSize: '15px' }}>🛡️</span>
          <span style={{ fontWeight: 700, fontSize: '13px', letterSpacing: '0.05em' }}>
            NANOGUARD <span style={{ color: '#88a0b0', fontWeight: 400 }}>v0.1.0</span>
          </span>
          <span style={{ fontSize: '10px', color: '#00e5ff', marginLeft: '6px', opacity: 0.8 }}>
            [ NATIVE ARMOR & HUNTER ]
          </span>
        </div>

        {/* Window action buttons */}
        <div className="window-no-drag" style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={() => handleWindowControl('minimize')}
            style={{
              background: 'none',
              border: 'none',
              color: '#88a0b0',
              padding: '4px 8px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            —
          </button>
          <button
            onClick={() => handleWindowControl('maximize')}
            style={{
              background: 'none',
              border: 'none',
              color: '#88a0b0',
              padding: '4px 8px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            ▢
          </button>
          <button
            onClick={() => handleWindowControl('close')}
            style={{
              background: 'none',
              border: 'none',
              color: '#88a0b0',
              padding: '4px 8px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div style={{
        display: 'flex',
        padding: '8px 16px',
        gap: '12px',
        backgroundColor: '#11222b',
        borderBottom: '1px solid #2c5364',
      }}>
        <button
          onClick={() => setActiveTab('audit')}
          className="small-caps"
          style={{
            padding: '8px 18px',
            backgroundColor: activeTab === 'audit' ? '#142833' : 'transparent',
            border: activeTab === 'audit' ? '1px solid #00e5ff' : '1px solid transparent',
            color: activeTab === 'audit' ? '#00e5ff' : '#88a0b0',
            borderRadius: '4px',
            fontWeight: 700,
            fontSize: '12px',
            cursor: 'pointer',
            boxShadow: activeTab === 'audit' ? '0 0 10px rgba(0, 229, 255, 0.2)' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>🛡️</span> [ ᴀᴜᴅɪᴛ & ꜱᴄᴀɴ ]
        </button>

        <button
          onClick={() => setActiveTab('protect')}
          className="small-caps"
          style={{
            padding: '8px 18px',
            backgroundColor: activeTab === 'protect' ? '#142833' : 'transparent',
            border: activeTab === 'protect' ? '1px solid #00e676' : '1px solid transparent',
            color: activeTab === 'protect' ? '#00e676' : '#88a0b0',
            borderRadius: '4px',
            fontWeight: 700,
            fontSize: '12px',
            cursor: 'pointer',
            boxShadow: activeTab === 'protect' ? '0 0 10px rgba(0, 230, 118, 0.2)' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>🔒</span> [ ᴘʀᴏᴛᴇᴄᴛ ᴊᴀʀ ]
        </button>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
        {activeTab === 'audit' ? (
          <AuditTab
            onSelectFile={handleSelectFile}
            selectedJar={selectedJar}
            scanning={scanning}
            onScan={handleScan}
            report={auditReport}
            rawLog={rawLog}
          />
        ) : (
          <ProtectTab onSelectFile={handleSelectFile} selectedJar={selectedJar} />
        )}
      </div>

      {/* Bottom Status Bar */}
      <div style={{
        height: '28px',
        backgroundColor: '#0b181d',
        borderTop: '1px solid #2c5364',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 14px',
        fontSize: '11px',
        fontFamily: 'JetBrains Mono',
      }}>
        <div style={{ display: 'flex', gap: '16px', color: '#88a0b0' }}>
          <span>
            CPU: <span style={{ color: '#00e676' }}>{stats.cpu}</span>
          </span>
          <span>
            RAM: <span style={{ color: '#00e5ff' }}>{stats.ram}</span>
          </span>
          <span style={{ color: '#80cbc4' }}>
            {stats.telemetry}
          </span>
        </div>

        <div style={{ color: '#546e7a' }}>
          NanoDev · <a href="https://t.me/WineSquad" target="_blank" rel="noreferrer" style={{ color: '#80cbc4', textDecoration: 'none' }}>t.me/WineSquad</a>
        </div>
      </div>
    </div>
  );
};

export default App;
