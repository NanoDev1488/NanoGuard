import React, { useState, useEffect } from 'react';
import { Titlebar } from './components/Titlebar';
import { AppHeader, TabType } from './components/AppHeader';
import { AuditView, AuditReport, Finding } from './components/AuditView';
import { ArmorView } from './components/ArmorView';
import { ConsoleView } from './components/ConsoleView';
import { CallGraphModal } from './components/CallGraphModal';
import { SettingsModal } from './components/SettingsModal';
import { StatusBar } from './components/StatusBar';
import { Toasts, ToastMessage } from './components/Toasts';

interface SystemStats {
  cpu: string;
  ram: string;
  telemetry: string;
}

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('audit');
  const [selectedJar, setSelectedJar] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [auditReport, setAuditReport] = useState<AuditReport | null>(null);
  const [rawLog, setRawLog] = useState<string>('');
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [engine, setEngine] = useState<'cpp' | 'rust'>('cpp');
  const [threads, setThreads] = useState(4);
  const [autoOpen, setAutoOpen] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [stats, setStats] = useState<SystemStats>({
    cpu: '1.2%',
    ram: '42 MB',
    telemetry: '0% TELEMETRY (OFFLINE)',
  });

  const addToast = (type: ToastMessage['type'], title: string, message: string) => {
    const id = `${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Poll system stats from backend
  useEffect(() => {
    const interval = setInterval(async () => {
      // @ts-ignore
      if (window.nanoGuardAPI?.getSystemStats) {
        try {
          // @ts-ignore
          const s = await window.nanoGuardAPI.getSystemStats();
          if (s) setStats(s);
        } catch {}
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
        addToast('info', 'Файл выбран', `Загружен: ${path.split(/[/\\]/).pop()}`);
      }
    } else {
      // Web browser preview fallback
      const fakePath = 'C:\\Plugins\\suspect_plugin.jar';
      setSelectedJar(fakePath);
      setAuditReport(null);
      addToast('info', 'Файл выбран', 'Загружен: suspect_plugin.jar');
    }
  };

  const handleScan = async (_mode?: 'fast' | 'deep') => {
    if (!selectedJar) return;
    setScanning(true);
    setAuditReport(null);
    setRawLog('');

    try {
      // @ts-ignore
      if (window.nanoGuardAPI?.auditJar) {
        // @ts-ignore
        const res = await window.nanoGuardAPI.auditJar(selectedJar);
        if (res && res.report) {
          setAuditReport(res.report);
          setRawLog(res.rawLog || '');
          const count = res.report.findings?.length || 0;
          if (count > 0) {
            addToast('error', 'Внимание: Обнаружены бэкдоры', `Найдено ${count} критических аномалий`);
          } else {
            addToast('success', 'Аудит завершен', 'Плагин чист. Бэкдоров не обнаружено.');
          }
        }
      } else {
        // Fallback for browser preview
        setTimeout(() => {
          const mockReport: AuditReport = {
            target: selectedJar,
            jar_name: selectedJar.split(/[/\\]/).pop(),
            total_classes: 24,
            total_packages: 5,
            obfuscator: 'Zelix KlassMaster / Stringer',
            entropy: 7.68,
            danger_score: 85,
            findings: [
              {
                category: 'ForceOP / Backdoor Hijack',
                severity: 'CRITICAL',
                class: 'ru/nanodev/exploit/ChatListener',
                method: 'onChat(AsyncPlayerChatEvent)V',
                offset: 1186,
                instruction: '0x04A2: invokevirtual org/bukkit/entity/Player.setOp(Z)',
                description: 'Скрытая выдача прав оператора (OP) при отправке секретного триггера в чат.',
              },
              {
                category: 'Data Exfiltration (Discord Webhook)',
                severity: 'HIGH',
                class: 'ru/nanodev/exploit/WebHookSender',
                method: 'sendData()V',
                offset: 48,
                instruction: '0x0030: ldc "https://discord.com/api/webhooks/112233..."',
                description: 'Утечка логов сервера, конфигурации и паролей на внешний вебхук.',
              },
              {
                category: 'RCE / Shell Execution',
                severity: 'HIGH',
                class: 'ru/nanodev/exploit/PayloadExecutor',
                method: 'exec()V',
                offset: 212,
                instruction: '0x00D4: invokevirtual java/lang/Runtime.exec(Ljava/lang/String;)Ljava/lang/Process;',
                description: 'Прямой запуск команд командной строки хост-системы Windows/Linux.',
              },
              {
                category: 'Remote Payload Download (Dropper)',
                severity: 'CRITICAL',
                class: 'ru/nanodev/exploit/ClassLoaderUtil',
                method: 'loadRemote()V',
                offset: 512,
                instruction: '0x0200: new java/net/URLClassLoader',
                description: 'Динамическая загрузка вредоносного jar из сети в обход проверки антивируса.',
              },
            ],
          };
          setAuditReport(mockReport);
          setRawLog(
            `[+] Target: ${selectedJar}\n[+] Scanned 24 classes.\n[!] Detected 4 severe backdoor patterns.\n[!] Threat Score: 85/100 (CRITICAL)\n`
          );
          setScanning(false);
          addToast('error', 'Внимание: Обнаружены бэкдоры', 'Найдено 4 критических аномалии');
        }, 800);
        return;
      }
    } catch (e) {
      console.error(e);
      addToast('error', 'Ошибка сканирования', 'Не удалось завершить аудит плагина');
    } finally {
      setScanning(false);
    }
  };

  const handleClear = () => {
    setSelectedJar(null);
    setAuditReport(null);
    setRawLog('');
  };

  const handleProtectComplete = (outPath: string) => {
    addToast('success', 'Плагин защищен', `Файл сохранен: ${outPath.split(/[/\\]/).pop()}`);
    if (autoOpen) {
      // @ts-ignore
      if (window.nanoGuardAPI?.openPath) {
        // @ts-ignore
        window.nanoGuardAPI.openPath(outPath);
      }
    }
  };

  const handleWindowControl = (action: 'minimize' | 'maximize' | 'close') => {
    // @ts-ignore
    if (window.nanoGuardAPI?.windowControl) {
      // @ts-ignore
      window.nanoGuardAPI.windowControl(action);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: '#070f14',
        color: '#e0f2f1',
        overflow: 'hidden',
      }}
    >
      {/* 1. Custom Frameless Title Bar */}
      <Titlebar
        onMinimize={() => handleWindowControl('minimize')}
        onMaximize={() => handleWindowControl('maximize')}
        onClose={() => handleWindowControl('close')}
      />

      {/* 2. Cyber App Header & Navigation */}
      <AppHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenSettings={() => setSettingsOpen(true)}
        selectedJar={selectedJar}
        threatCount={auditReport?.findings?.length || 0}
      />

      {/* 3. Main Workspace Area */}
      <div style={{ flex: 1, padding: '14px', overflowY: 'auto' }}>
        {activeTab === 'audit' && (
          <AuditView
            onSelectFile={handleSelectFile}
            selectedJar={selectedJar}
            scanning={scanning}
            onScan={handleScan}
            onClear={handleClear}
            report={auditReport}
            rawLog={rawLog}
            onOpenCallGraph={(f) => setSelectedFinding(f)}
          />
        )}

        {activeTab === 'protect' && (
          <ArmorView
            onSelectFile={handleSelectFile}
            selectedJar={selectedJar}
            onProtectComplete={handleProtectComplete}
          />
        )}

        {activeTab === 'console' && (
          <ConsoleView rawLog={rawLog} onClear={() => setRawLog('')} />
        )}
      </div>

      {/* 4. Bottom Cyber Status Bar */}
      <StatusBar
        cpu={stats.cpu}
        ram={stats.ram}
        telemetry={stats.telemetry}
        engine={engine}
      />

      {/* 5. Modals & Notifications */}
      <CallGraphModal
        finding={selectedFinding}
        onClose={() => setSelectedFinding(null)}
      />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        engine={engine}
        setEngine={setEngine}
        threads={threads}
        setThreads={setThreads}
        autoOpen={autoOpen}
        setAutoOpen={setAutoOpen}
      />

      <Toasts toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};

export default App;
