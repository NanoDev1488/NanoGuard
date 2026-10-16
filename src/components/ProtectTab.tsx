import React, { useState } from 'react';

interface ProtectTabProps {
  onSelectFile: () => void;
  selectedJar: string | null;
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

export const ProtectTab: React.FC<ProtectTabProps> = ({ onSelectFile, selectedJar }) => {
  const [stripLvt, setStripLvt] = useState(true);
  const [encryptStrings, setEncryptStrings] = useState(true);
  const [antiDecompile, setAntiDecompile] = useState(true);
  const [protecting, setProtecting] = useState(false);
  const [result, setResult] = useState<ProtectResult | null>(null);

  const handleProtect = async () => {
    if (!selectedJar) return;
    setProtecting(true);
    setResult(null);

    try {
      // @ts-ignore
      const res = await window.nanoGuardAPI?.protectJar({
        jarPath: selectedJar,
        stripLvt,
        encryptStrings,
        antiDecompile,
      });
      setResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setProtecting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
      {/* Drag & Drop Hero Box */}
      <div
        onClick={onSelectFile}
        style={{
          border: '2px dashed #2c5364',
          borderRadius: '8px',
          padding: '24px',
          textAlign: 'center',
          backgroundColor: '#142833',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#00e676';
          e.currentTarget.style.backgroundColor = '#16313f';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#2c5364';
          e.currentTarget.style.backgroundColor = '#142833';
        }}
      >
        <div style={{ fontSize: '32px' }}>🔒</div>
        <div className="small-caps" style={{ fontSize: '15px', fontWeight: 700, color: '#00e676' }}>
          {selectedJar ? selectedJar.split(/(\\|\/)/).pop() : 'ᴘᴇʀᴇᴛᴀꜱʜɪᴛᴇ .ᴊᴀʀ ꜱʏᴜᴅᴀ'}
        </div>
        <div style={{ fontSize: '12px', color: '#88a0b0' }}>
          {selectedJar ? selectedJar : 'выберите ваш исходный плагин для наложения защиты'}
        </div>
      </div>

      {/* Configuration Options */}
      <div style={{ backgroundColor: '#142833', border: '1px solid #2c5364', borderRadius: '6px', padding: '16px' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#00e676', marginBottom: '14px' }}>
          ПАРАМЕТРЫ БРОНИРОВАНИЯ БАЙТКОДА (BYTECODE ARMOR)
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={stripLvt}
              onChange={(e) => setStripLvt(e.target.checked)}
              style={{ marginTop: '3px', accentColor: '#00e676' }}
            />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#e0f2f1' }}>
                Вырезание отладочного мусора (Metadata Stripping)
              </div>
              <div style={{ fontSize: '11px', color: '#88a0b0' }}>
                Удаляет LineNumberTable, LocalVariableTable, SourceFile. Снижает вес на 25–40% и стирает имена локальных переменных.
              </div>
            </div>
          </label>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={encryptStrings}
              onChange={(e) => setEncryptStrings(e.target.checked)}
              style={{ marginTop: '3px', accentColor: '#00e676' }}
            />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#e0f2f1' }}>
                Динамическое шифрование строк (Polymorphic XOR+)
              </div>
              <div style={{ fontSize: '11px', color: '#88a0b0' }}>
                Все строковые литералы разбиваются на байты и шифруются уникальным ключом билда.
              </div>
            </div>
          </label>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={antiDecompile}
              onChange={(e) => setAntiDecompile(e.target.checked)}
              style={{ marginTop: '3px', accentColor: '#00e676' }}
            />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#e0f2f1' }}>
                Ловушки для декомпиляторов (Anti-CFR / Anti-Fernflower)
              </div>
              <div style={{ fontSize: '11px', color: '#88a0b0' }}>
                Генерация синтетических мостовых методов (ACC_SYNTHETIC | ACC_BRIDGE) и циклов перехода, ломающих JD-GUI и Jadx.
              </div>
            </div>
          </label>
        </div>

        {selectedJar && (
          <button
            onClick={handleProtect}
            disabled={protecting}
            style={{
              marginTop: '16px',
              width: '100%',
              padding: '10px',
              backgroundColor: '#00e676',
              color: '#0f2027',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 700,
              fontSize: '13px',
              cursor: protecting ? 'not-allowed' : 'pointer',
              opacity: protecting ? 0.7 : 1,
            }}
          >
            {protecting ? 'ПРИМЕНЕНИЕ БРОНИ...' : '🔒 ЗАЩИТИТЬ ПЛАГИН'}
          </button>
        )}
      </div>

      {/* Result Section */}
      {result && (
        <div style={{ backgroundColor: '#142833', border: '1px solid #00e676', borderRadius: '6px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '18px' }}>✓</span>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#00e676' }}>
              ПЛАГИН УСПЕШНО ЗАЩИЩЕН
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '12px' }}>
            <div style={{ backgroundColor: '#0f2027', padding: '10px', borderRadius: '4px' }}>
              <div style={{ fontSize: '11px', color: '#88a0b0' }}>Удалено LVT/Строк</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#e0f2f1', marginTop: '2px' }}>
                {result.stats.strippedAttributes}
              </div>
            </div>

            <div style={{ backgroundColor: '#0f2027', padding: '10px', borderRadius: '4px' }}>
              <div style={{ fontSize: '11px', color: '#88a0b0' }}>Зашифровано строк</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#e0f2f1', marginTop: '2px' }}>
                {result.stats.encryptedStrings}
              </div>
            </div>

            <div style={{ backgroundColor: '#0f2027', padding: '10px', borderRadius: '4px' }}>
              <div style={{ fontSize: '11px', color: '#88a0b0' }}>Экономия размера</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#00e676', marginTop: '2px' }}>
                {result.stats.compressionPercent}
              </div>
            </div>
          </div>

          <div style={{ fontSize: '12px', color: '#88a0b0', fontFamily: 'JetBrains Mono' }}>
            Файл сохранен: <span style={{ color: '#00e5ff' }}>{result.outputPath}</span>
          </div>
        </div>
      )}
    </div>
  );
};
