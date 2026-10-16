import React, { useState } from 'react';
import { CallGraphModal } from './CallGraphModal';

interface Finding {
  category: string;
  severity: string;
  class: string;
  method: string;
  offset: number;
  instruction: string;
  description: string;
}

interface AuditReport {
  target: string;
  total_classes: number;
  obfuscator: string;
  danger_score: number;
  findings: Finding[];
}

interface AuditTabProps {
  onSelectFile: () => void;
  selectedJar: string | null;
  scanning: boolean;
  onScan: () => void;
  report: AuditReport | null;
  rawLog: string;
}

export const AuditTab: React.FC<AuditTabProps> = ({
  onSelectFile,
  selectedJar,
  scanning,
  onScan,
  report,
  rawLog,
}) => {
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);

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
          e.currentTarget.style.borderColor = '#00e5ff';
          e.currentTarget.style.backgroundColor = '#16313f';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#2c5364';
          e.currentTarget.style.backgroundColor = '#142833';
        }}
      >
        <div style={{ fontSize: '32px' }}>🛡️</div>
        <div className="small-caps" style={{ fontSize: '15px', fontWeight: 700, color: '#00e5ff' }}>
          {selectedJar ? selectedJar.split(/(\\|\/)/).pop() : 'ᴘᴇʀᴇᴛᴀꜱʜɪᴛᴇ .ᴊᴀʀ ꜱʏᴜᴅᴀ'}
        </div>
        <div style={{ fontSize: '12px', color: '#88a0b0' }}>
          {selectedJar ? selectedJar : 'или нажмите для выбора плагина для аудита'}
        </div>
        {selectedJar && !scanning && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onScan();
            }}
            style={{
              marginTop: '8px',
              padding: '6px 20px',
              backgroundColor: '#00e5ff',
              color: '#0f2027',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            ЗАПУСТИТЬ АУДИТ
          </button>
        )}
      </div>

      {scanning && (
        <div style={{
          padding: '16px',
          backgroundColor: '#142833',
          border: '1px solid #2c5364',
          borderRadius: '6px',
          textAlign: 'center',
          color: '#00e5ff',
          fontFamily: 'JetBrains Mono',
          fontSize: '13px',
        }}>
          [⟳] Потоковый парсинг байткода и анализ сигнатур бэкдоров...
        </div>
      )}

      {/* Results Section */}
      {report && !scanning && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, overflowY: 'auto' }}>
          {/* Top Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            <div style={{ backgroundColor: '#142833', border: '1px solid #2c5364', borderRadius: '6px', padding: '12px' }}>
              <div style={{ fontSize: '11px', color: '#88a0b0' }}>КЛАССОВ</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#e0f2f1', marginTop: '4px' }}>
                {report.total_classes}
              </div>
            </div>

            <div style={{ backgroundColor: '#142833', border: '1px solid #2c5364', borderRadius: '6px', padding: '12px' }}>
              <div style={{ fontSize: '11px', color: '#88a0b0' }}>ОБФУСКАЦИЯ</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffab00', marginTop: '6px' }}>
                {report.obfuscator}
              </div>
            </div>

            <div style={{ backgroundColor: '#142833', border: '1px solid #2c5364', borderRadius: '6px', padding: '12px' }}>
              <div style={{ fontSize: '11px', color: '#88a0b0' }}>УГРОЗ НАЙДЕНО</div>
              <div style={{
                fontSize: '20px',
                fontWeight: 700,
                color: report.findings.length > 0 ? '#ff1744' : '#00e676',
                marginTop: '4px',
              }}>
                {report.findings.length}
              </div>
            </div>

            <div style={{ backgroundColor: '#142833', border: '1px solid #2c5364', borderRadius: '6px', padding: '12px' }}>
              <div style={{ fontSize: '11px', color: '#88a0b0' }}>ИНДЕКС ОПАСНОСТИ</div>
              <div style={{
                fontSize: '20px',
                fontWeight: 700,
                color: report.danger_score > 50 ? '#ff1744' : report.danger_score > 20 ? '#ffab00' : '#00e676',
                marginTop: '4px',
              }}>
                {report.danger_score} / 100
              </div>
            </div>
          </div>

          {/* Threat List */}
          <div style={{ backgroundColor: '#142833', border: '1px solid #2c5364', borderRadius: '6px', padding: '14px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#00e5ff', marginBottom: '10px' }}>
              НАЙДЕННЫЕ АНОМАЛИИ И БЭКДОР-СИГНАТУРЫ
            </div>

            {report.findings.length === 0 ? (
              <div style={{ color: '#00e676', fontSize: '13px', padding: '10px 0' }}>
                ✓ Подозрительных вставок кода не обнаружено. Плагин чист.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {report.findings.map((f, i) => (
                  <div
                    key={i}
                    style={{
                      backgroundColor: '#1b3542',
                      border: '1px solid #2c5364',
                      borderRadius: '4px',
                      padding: '10px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '3px',
                          backgroundColor: f.severity === 'CRITICAL' ? 'rgba(255,23,68,0.2)' : 'rgba(255,171,0,0.2)',
                          color: f.severity === 'CRITICAL' ? '#ff1744' : '#ffab00',
                        }}>
                          {f.severity}
                        </span>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#e0f2f1' }}>
                          {f.category}
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedFinding(f)}
                        style={{
                          backgroundColor: 'transparent',
                          border: '1px solid #00e5ff',
                          color: '#00e5ff',
                          fontSize: '11px',
                          padding: '3px 8px',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontWeight: 600,
                        }}
                      >
                        ГРАФ ВЫЗОВОВ ➔
                      </button>
                    </div>

                    <div style={{ fontSize: '11px', color: '#88a0b0', fontFamily: 'JetBrains Mono' }}>
                      Локация: {f.class}#{f.method} (offset: {f.offset})
                    </div>
                    <div style={{
                      fontSize: '11px',
                      fontFamily: 'JetBrains Mono',
                      backgroundColor: '#0f2027',
                      padding: '4px 8px',
                      borderRadius: '3px',
                      color: '#ff5252',
                    }}>
                      {f.instruction}
                    </div>
                    <div style={{ fontSize: '12px', color: '#cfd8dc' }}>
                      {f.description}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Raw Log */}
          {rawLog && (
            <div style={{ backgroundColor: '#0f2027', border: '1px solid #2c5364', borderRadius: '6px', padding: '12px' }}>
              <div style={{ fontSize: '11px', color: '#88a0b0', marginBottom: '6px', fontWeight: 600 }}>
                ЛОГ НАЙДЕННЫХ СМЕЩЕНИЙ
              </div>
              <pre style={{
                fontFamily: 'JetBrains Mono',
                fontSize: '11px',
                color: '#80cbc4',
                whiteSpace: 'pre-wrap',
                maxHeight: '120px',
                overflowY: 'auto',
              }}>
                {rawLog}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Interactive Modal */}
      <CallGraphModal finding={selectedFinding} onClose={() => setSelectedFinding(null)} />
    </div>
  );
};
