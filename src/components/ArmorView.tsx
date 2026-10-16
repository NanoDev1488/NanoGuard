import React, { useState } from 'react';

interface ArmorViewProps {
  onSelectFile: () => void;
  selectedJar: string | null;
  onProtectComplete?: (outPath: string) => void;
}

interface ProtectResult {
  outputPath: string;
  stats: {
    strippedAttributes: number;
    encryptedStrings: number;
    injectedTraps: number;
    originalSize: number;
    protectedSize: number;
    compressionPercent: string;
  };
}

export const ArmorView: React.FC<ArmorViewProps> = ({ onSelectFile, selectedJar, onProtectComplete }) => {
  const [stripLvt, setStripLvt] = useState(true);
  const [encryptStrings, setEncryptStrings] = useState(true);
  const [antiDecompile, setAntiDecompile] = useState(true);
  const [preserveBukkit, setPreserveBukkit] = useState(true);
  const [protecting, setProtecting] = useState(false);
  const [result, setResult] = useState<ProtectResult | null>(null);
  const [customOutPath, setCustomOutPath] = useState<string>('');

  const defaultOutPath = selectedJar ? selectedJar.replace(/\.jar$/i, '_protected.jar') : '';
  const finalOut = customOutPath || defaultOutPath;

  const handleSelectOutputDir = async () => {
    // @ts-ignore
    if (window.nanoGuardAPI?.selectOutputDir) {
      // @ts-ignore
      const dir = await window.nanoGuardAPI.selectOutputDir();
      if (dir && selectedJar) {
        const base = selectedJar.split(/[/\\]/).pop()?.replace(/\.jar$/i, '_protected.jar');
        setCustomOutPath(`${dir}\\${base}`);
      }
    }
  };

  const handleProtect = async () => {
    if (!selectedJar) return;
    setProtecting(true);
    setResult(null);

    try {
      // @ts-ignore
      if (window.nanoGuardAPI?.protectJar) {
        // @ts-ignore
        const res = await window.nanoGuardAPI.protectJar({
          jarPath: selectedJar,
          stripLvt,
          encryptStrings,
          antiDecompile,
          outputPath: finalOut,
        });
        if (res && res.success) {
          setResult(res);
          if (onProtectComplete) onProtectComplete(res.outputPath);
        } else {
          setResult(res);
        }
      } else {
        // Fallback simulation for browser testing
        setTimeout(() => {
          const fakeRes: ProtectResult = {
            outputPath: finalOut || 'C:\\Plugins\\suspect_plugin_protected.jar',
            stats: {
              strippedAttributes: 142,
              encryptedStrings: 94,
              injectedTraps: 34,
              originalSize: 450200,
              protectedSize: 325400,
              compressionPercent: '27.7%',
            },
          };
          setResult(fakeRes);
          setProtecting(false);
        }, 800);
        return;
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProtecting(false);
    }
  };

  const handleOpenInExplorer = async () => {
    if (!result?.outputPath) return;
    // @ts-ignore
    if (window.nanoGuardAPI?.openPath) {
      // @ts-ignore
      await window.nanoGuardAPI.openPath(result.outputPath);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', height: '100%' }}>
      {/* Hero Drop Box */}
      <div
        onClick={onSelectFile}
        style={{
          border: '2px dashed #1a3644',
          borderRadius: '8px',
          padding: '20px',
          textAlign: 'center',
          backgroundColor: '#0d1c24',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          boxShadow: 'inset 0 0 20px rgba(0, 230, 118, 0.03)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#00e676';
          e.currentTarget.style.backgroundColor = '#102530';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#1a3644';
          e.currentTarget.style.backgroundColor = '#0d1c24';
        }}
      >
        <div style={{ fontSize: '30px', filter: 'drop-shadow(0 0 8px #00e676)' }}>🔒</div>
        <div className="small-caps" style={{ fontSize: '15px', fontWeight: 800, color: '#00e676' }}>
          {selectedJar ? selectedJar.split(/[/\\]/).pop() : 'ᴘᴇʀᴇᴛᴀꜱʜɪᴛᴇ .ᴊᴀʀ ꜱʏᴜᴅᴀ'}
        </div>
        <div style={{ fontSize: '11px', color: '#88a0b0' }}>
          {selectedJar ? (
            <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#80cbc4' }}>{selectedJar}</span>
          ) : (
            'Выберите ваш скомпилированный Spigot / Paper / Velocity плагин для наложения нативной брони'
          )}
        </div>
      </div>

      {/* Armor Options Container */}
      <div
        style={{
          backgroundColor: '#0d1c24',
          border: '1px solid #1a3644',
          borderRadius: '6px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#00e676', letterSpacing: '0.05em' }}>
            МОДУЛИ ЗАЩИТЫ (BYTECODE ARMOR PIPELINE)
          </div>
          <span style={{ fontSize: '10px', color: '#607d8b', fontFamily: 'JetBrains Mono, monospace' }}>
            NATIVE C++17 OPTIMIZED
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
          {/* Option 1: Metadata Stripping */}
          <label
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              backgroundColor: '#12232c',
              padding: '10px 12px',
              borderRadius: '4px',
              border: '1px solid #1e3c4d',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={stripLvt}
              onChange={(e) => setStripLvt(e.target.checked)}
              style={{ marginTop: '2px', accentColor: '#00e676' }}
            />
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#e0f2f1' }}>
                Вырезание отладочного мусора (LVT/LineNumbers)
              </div>
              <div style={{ fontSize: '10px', color: '#88a0b0', marginTop: '2px' }}>
                Удаляет таблицы локальных переменных и имена. Снижает вес JAR до 40% и ломает декомпиляцию.
              </div>
            </div>
          </label>

          {/* Option 2: String Encryption */}
          <label
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              backgroundColor: '#12232c',
              padding: '10px 12px',
              borderRadius: '4px',
              border: '1px solid #1e3c4d',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={encryptStrings}
              onChange={(e) => setEncryptStrings(e.target.checked)}
              style={{ marginTop: '2px', accentColor: '#00e676' }}
            />
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#e0f2f1' }}>
                Динамическое шифрование строк (Polymorphic XOR+)
              </div>
              <div style={{ fontSize: '10px', color: '#88a0b0', marginTop: '2px' }}>
                Строковые литералы разбиваются на байты и шифруются уникальным ключом, генерируемым для билда.
              </div>
            </div>
          </label>

          {/* Option 3: Anti-Decompiler */}
          <label
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              backgroundColor: '#12232c',
              padding: '10px 12px',
              borderRadius: '4px',
              border: '1px solid #1e3c4d',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={antiDecompile}
              onChange={(e) => setAntiDecompile(e.target.checked)}
              style={{ marginTop: '2px', accentColor: '#00e676' }}
            />
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#e0f2f1' }}>
                Ловушки для декомпиляторов (Anti-CFR / Jadx / Fernflower)
              </div>
              <div style={{ fontSize: '10px', color: '#88a0b0', marginTop: '2px' }}>
                Инъекция синтетических мостовых методов (ACC_SYNTHETIC | ACC_BRIDGE) и невалидных переходов.
              </div>
            </div>
          </label>

          {/* Option 4: Preserve Bukkit */}
          <label
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              backgroundColor: '#12232c',
              padding: '10px 12px',
              borderRadius: '4px',
              border: '1px solid #1e3c4d',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={preserveBukkit}
              onChange={(e) => setPreserveBukkit(e.target.checked)}
              style={{ marginTop: '2px', accentColor: '#00e676' }}
            />
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#e0f2f1' }}>
                Сохранение Bukkit / Spigot сигнатур
              </div>
              <div style={{ fontSize: '10px', color: '#88a0b0', marginTop: '2px' }}>
                Защита не ломает @EventHandler методы, plugin.yml и публичные команды плагина.
              </div>
            </div>
          </label>
        </div>

        {/* Output path selector */}
        {selectedJar && (
          <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ fontSize: '11px', color: '#88a0b0', fontWeight: 600 }}>
              ПУТЬ СОХРАНЕНИЯ ЗАЩИЩЕННОГО JAR:
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={finalOut}
                onChange={(e) => setCustomOutPath(e.target.value)}
                style={{
                  flex: 1,
                  backgroundColor: '#081217',
                  border: '1px solid #1a3644',
                  borderRadius: '4px',
                  padding: '6px 10px',
                  color: '#80cbc4',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '11px',
                }}
              />
              <button
                onClick={handleSelectOutputDir}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#142a36',
                  border: '1px solid #285066',
                  color: '#cfd8dc',
                  borderRadius: '4px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Обзор...
              </button>
            </div>
          </div>
        )}

        {/* Large Action Button */}
        {selectedJar && (
          <button
            onClick={handleProtect}
            disabled={protecting}
            className="small-caps"
            style={{
              marginTop: '8px',
              padding: '12px',
              backgroundColor: '#00e676',
              color: '#070f14',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 800,
              fontSize: '13px',
              cursor: protecting ? 'wait' : 'pointer',
              boxShadow: '0 0 16px rgba(0, 230, 118, 0.35)',
              transition: 'all 0.15s ease',
            }}
          >
            {protecting ? '⏳ ПРИМЕНЕНИЕ БРОНИ И СОХРАНЕНИЕ...' : '🔒 ЗАЩИТИТЬ ПЛАГИН И СОХРАНИТЬ JAR'}
          </button>
        )}
      </div>

      {/* Result Card */}
      {result && (
        <div
          style={{
            backgroundColor: '#0d1c24',
            border: '1px solid #00e676',
            borderRadius: '6px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxShadow: '0 0 16px rgba(0, 230, 118, 0.2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px', color: '#00e676' }}>✓</span>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#00e676', letterSpacing: '0.05em' }}>
              ПЛАГИН УСПЕШНО ЗАЩИЩЕН И СОХРАНЕН НА ДИСК
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            <div style={{ backgroundColor: '#12232c', padding: '10px', borderRadius: '4px' }}>
              <div style={{ fontSize: '10px', color: '#88a0b0' }}>Удалено LVT атрибутов</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#e0f2f1', marginTop: '2px' }}>
                {result.stats.strippedAttributes}
              </div>
            </div>

            <div style={{ backgroundColor: '#12232c', padding: '10px', borderRadius: '4px' }}>
              <div style={{ fontSize: '10px', color: '#88a0b0' }}>Зашифровано строк</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#00e5ff', marginTop: '2px' }}>
                {result.stats.encryptedStrings}
              </div>
            </div>

            <div style={{ backgroundColor: '#12232c', padding: '10px', borderRadius: '4px' }}>
              <div style={{ fontSize: '10px', color: '#88a0b0' }}>Внедрено ловушек</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#ffab00', marginTop: '2px' }}>
                {result.stats.injectedTraps}
              </div>
            </div>

            <div style={{ backgroundColor: '#12232c', padding: '10px', borderRadius: '4px' }}>
              <div style={{ fontSize: '10px', color: '#88a0b0' }}>Экономия размера</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#00e676', marginTop: '2px' }}>
                {result.stats.compressionPercent}
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#081217',
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid #1a3644',
            }}
          >
            <div style={{ fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: '#80cbc4' }}>
              Файл: {result.outputPath}
            </div>

            <button
              onClick={handleOpenInExplorer}
              style={{
                padding: '4px 12px',
                backgroundColor: '#142a36',
                border: '1px solid #00e676',
                color: '#00e676',
                borderRadius: '3px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              📂 Открыть в проводнике
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
