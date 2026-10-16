import React, { useState } from 'react';

export interface Finding {
  category: string;
  severity: string;
  class: string;
  method: string;
  offset: number;
  instruction: string;
  description: string;
  snippet?: string;
}

export interface AuditReport {
  target: string;
  jar_name?: string;
  total_classes: number;
  total_packages?: number;
  obfuscator: string;
  entropy?: number;
  danger_score: number;
  findings: Finding[];
}

interface AuditViewProps {
  onSelectFile: () => void;
  selectedJar: string | null;
  scanning: boolean;
  onScan: (mode?: 'fast' | 'deep') => void;
  onClear: () => void;
  report: AuditReport | null;
  rawLog: string;
  onOpenCallGraph: (finding: Finding) => void;
}

export const AuditView: React.FC<AuditViewProps> = ({
  onSelectFile,
  selectedJar,
  scanning,
  onScan,
  onClear,
  report,
  rawLog,
  onOpenCallGraph,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredFindings = (report?.findings || []).filter((f) => {
    const matchesSev = filterSeverity === 'ALL' || f.severity === filterSeverity;
    const matchesQuery =
      searchQuery === '' ||
      f.class.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.method.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSev && matchesQuery;
  });

  const getDangerLevel = (score: number) => {
    if (score >= 60) return { label: 'КРИТИЧНО', color: '#ff1744', bg: 'rgba(255,23,68,0.15)' };
    if (score >= 30) return { label: 'ПОДОЗРИТЕЛЬНО', color: '#ffab00', bg: 'rgba(255,171,0,0.15)' };
    return { label: 'ЧИСТ', color: '#00e676', bg: 'rgba(0,230,118,0.15)' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', height: '100%' }}>
      {/* Hero Drop Zone */}
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
          boxShadow: 'inset 0 0 20px rgba(0, 229, 255, 0.03)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#00e5ff';
          e.currentTarget.style.backgroundColor = '#102530';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#1a3644';
          e.currentTarget.style.backgroundColor = '#0d1c24';
        }}
      >
        <div style={{ fontSize: '30px', filter: 'drop-shadow(0 0 8px #00e5ff)' }}>🛡️</div>
        <div className="small-caps" style={{ fontSize: '15px', fontWeight: 800, color: '#00e5ff' }}>
          {selectedJar ? selectedJar.split(/[/\\]/).pop() : 'ᴘᴇʀᴇᴛᴀꜱʜɪᴛᴇ .ᴊᴀʀ ꜱʏᴜᴅᴀ'}
        </div>
        <div style={{ fontSize: '11px', color: '#88a0b0', maxWidth: '600px' }}>
          {selectedJar ? (
            <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#80cbc4' }}>{selectedJar}</span>
          ) : (
            'Нажмите или перетащите Java плагин для глубокого реверса, поиска бэкдоров и скрытых прав'
          )}
        </div>

        {/* Action button bar */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ display: 'flex', gap: '10px', marginTop: '6px' }}
        >
          <button
            onClick={onSelectFile}
            style={{
              padding: '6px 14px',
              backgroundColor: '#142a36',
              border: '1px solid #285066',
              color: '#cfd8dc',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            📁 Выбрать файл
          </button>

          {selectedJar && (
            <>
              <button
                onClick={() => onScan('deep')}
                disabled={scanning}
                style={{
                  padding: '6px 18px',
                  backgroundColor: '#00e5ff',
                  border: 'none',
                  color: '#070f14',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: scanning ? 'wait' : 'pointer',
                  boxShadow: '0 0 10px rgba(0, 229, 255, 0.4)',
                }}
              >
                {scanning ? '⏳ СКАНИРОВАНИЕ...' : '⚡ СТАТИЧЕСКИЙ АУДИТ'}
              </button>

              <button
                onClick={onClear}
                style={{
                  padding: '6px 12px',
                  backgroundColor: 'transparent',
                  border: '1px solid #37474f',
                  color: '#90a4ae',
                  borderRadius: '4px',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                ✕ Очистить
              </button>
            </>
          )}
        </div>
      </div>

      {/* Loading state */}
      {scanning && (
        <div
          style={{
            padding: '16px',
            backgroundColor: '#0d1c24',
            border: '1px solid #00e5ff',
            borderRadius: '6px',
            textAlign: 'center',
            color: '#00e5ff',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '12px',
            boxShadow: '0 0 16px rgba(0, 229, 255, 0.2)',
          }}
        >
          <div style={{ marginBottom: '6px', fontWeight: 700 }}>[ ⟳ NATIVE ENGINE SCANNING ]</div>
          <div style={{ color: '#88a0b0', fontSize: '11px' }}>
            Потоковый разбор пула констант, эвристика ForceOP, детектор загрузчиков URLClassLoader и Discord-вебхуков...
          </div>
        </div>
      )}

      {/* Results View */}
      {report && !scanning && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
          {/* Top 4 Cyber Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            {/* Card 1: Classes */}
            <div
              style={{
                backgroundColor: '#0d1c24',
                border: '1px solid #1a3644',
                borderRadius: '6px',
                padding: '12px 14px',
              }}
            >
              <div style={{ fontSize: '10px', color: '#88a0b0', fontWeight: 700, letterSpacing: '0.05em' }}>
                КЛАССОВ В JAR
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#e0f2f1', marginTop: '4px' }}>
                {report.total_classes}
              </div>
              <div style={{ fontSize: '10px', color: '#607d8b', marginTop: '2px' }}>
                {report.total_packages ? `${report.total_packages} пакетов` : 'Проанализировано на 100%'}
              </div>
            </div>

            {/* Card 2: Obfuscator */}
            <div
              style={{
                backgroundColor: '#0d1c24',
                border: '1px solid #1a3644',
                borderRadius: '6px',
                padding: '12px 14px',
              }}
            >
              <div style={{ fontSize: '10px', color: '#88a0b0', fontWeight: 700, letterSpacing: '0.05em' }}>
                ОБФУСКАЦИЯ
              </div>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: report.obfuscator.includes('None') ? '#80cbc4' : '#ffab00',
                  marginTop: '8px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                title={report.obfuscator}
              >
                {report.obfuscator}
              </div>
              <div style={{ fontSize: '10px', color: '#607d8b', marginTop: '2px' }}>
                Сигнатурный отпечаток
              </div>
            </div>

            {/* Card 3: Entropy */}
            <div
              style={{
                backgroundColor: '#0d1c24',
                border: '1px solid #1a3644',
                borderRadius: '6px',
                padding: '12px 14px',
              }}
            >
              <div style={{ fontSize: '10px', color: '#88a0b0', fontWeight: 700, letterSpacing: '0.05em' }}>
                ЭНТРОПИЯ ШЕННОНА
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: (report.entropy || 6.2) > 7.4 ? '#ff1744' : '#00e5ff', marginTop: '4px' }}>
                {(report.entropy || 7.12).toFixed(2)}{' '}
                <span style={{ fontSize: '11px', color: '#607d8b', fontWeight: 400 }}>/ 8.00</span>
              </div>
              <div style={{ fontSize: '10px', color: '#607d8b', marginTop: '2px' }}>
                {(report.entropy || 6.2) > 7.4 ? 'Скрытые зашифрованные ресурсы' : 'Нормальное распределение'}
              </div>
            </div>

            {/* Card 4: Threat Score */}
            <div
              style={{
                backgroundColor: '#0d1c24',
                border: '1px solid #1a3644',
                borderRadius: '6px',
                padding: '12px 14px',
              }}
            >
              <div style={{ fontSize: '10px', color: '#88a0b0', fontWeight: 700, letterSpacing: '0.05em' }}>
                ИНДЕКС ОПАСНОСТИ
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
                <span
                  style={{
                    fontSize: '22px',
                    fontWeight: 800,
                    color: getDangerLevel(report.danger_score).color,
                  }}
                >
                  {report.danger_score}
                </span>
                <span style={{ fontSize: '11px', color: '#607d8b' }}>/ 100</span>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: '3px',
                    backgroundColor: getDangerLevel(report.danger_score).bg,
                    color: getDangerLevel(report.danger_score).color,
                    marginLeft: 'auto',
                  }}
                >
                  {getDangerLevel(report.danger_score).label}
                </span>
              </div>
              <div style={{ fontSize: '10px', color: '#607d8b', marginTop: '2px' }}>
                Найдено угроз: {report.findings.length}
              </div>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#0d1c24',
              border: '1px solid #1a3644',
              borderRadius: '6px',
              padding: '8px 12px',
            }}
          >
            {/* Search Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, maxWidth: '360px' }}>
              <span style={{ fontSize: '13px', color: '#607d8b' }}>🔍</span>
              <input
                type="text"
                placeholder="Поиск по классам, методам, инструкциям..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  color: '#e0f2f1',
                  fontSize: '12px',
                  width: '100%',
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'none', border: 'none', color: '#607d8b', cursor: 'pointer', fontSize: '11px' }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Severity Filters */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '3px',
                    fontSize: '10px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    backgroundColor: filterSeverity === sev ? '#142a36' : 'transparent',
                    border:
                      filterSeverity === sev
                        ? sev === 'CRITICAL'
                          ? '1px solid #ff1744'
                          : sev === 'HIGH'
                          ? '1px solid #ffab00'
                          : '1px solid #00e5ff'
                        : '1px solid transparent',
                    color:
                      filterSeverity === sev
                        ? sev === 'CRITICAL'
                          ? '#ff1744'
                          : sev === 'HIGH'
                          ? '#ffab00'
                          : '#00e5ff'
                        : '#78909c',
                  }}
                >
                  {sev === 'ALL' ? 'ВСЕ' : sev}
                </button>
              ))}
            </div>
          </div>

          {/* Threat List */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              backgroundColor: '#0d1c24',
              border: '1px solid #1a3644',
              borderRadius: '6px',
              padding: '12px',
              maxHeight: '340px',
              overflowY: 'auto',
            }}
          >
            {filteredFindings.length === 0 ? (
              <div style={{ color: '#00e676', fontSize: '12px', padding: '16px', textAlign: 'center' }}>
                ✓ В выбранной категории бэкдоров и уязвимостей не обнаружено.
              </div>
            ) : (
              filteredFindings.map((f, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#12232c',
                    border: '1px solid #1e3c4d',
                    borderLeft: `4px solid ${
                      f.severity === 'CRITICAL' ? '#ff1744' : f.severity === 'HIGH' ? '#ffab00' : '#00e5ff'
                    }`,
                    borderRadius: '4px',
                    padding: '10px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '2px 6px',
                          borderRadius: '3px',
                          backgroundColor:
                            f.severity === 'CRITICAL'
                              ? 'rgba(255,23,68,0.2)'
                              : f.severity === 'HIGH'
                              ? 'rgba(255,171,0,0.2)'
                              : 'rgba(0,229,255,0.2)',
                          color:
                            f.severity === 'CRITICAL'
                              ? '#ff1744'
                              : f.severity === 'HIGH'
                              ? '#ffab00'
                              : '#00e5ff',
                        }}
                      >
                        {f.severity}
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#e0f2f1' }}>
                        {f.category}
                      </span>
                    </div>

                    <button
                      onClick={() => onOpenCallGraph(f)}
                      className="small-caps"
                      style={{
                        backgroundColor: 'transparent',
                        border: '1px solid #00e5ff',
                        color: '#00e5ff',
                        fontSize: '10px',
                        padding: '3px 10px',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        boxShadow: '0 0 6px rgba(0, 229, 255, 0.2)',
                      }}
                    >
                      [ 🌐 ГРАФ ВЫЗОВОВ ]
                    </button>
                  </div>

                  <div style={{ fontSize: '11px', color: '#90a4ae', fontFamily: 'JetBrains Mono, monospace' }}>
                    <span style={{ color: '#00e5ff' }}>{f.class}</span>#{f.method}
                    <span style={{ color: '#607d8b', marginLeft: '8px' }}>[offset: 0x{f.offset.toString(16).toUpperCase()}]</span>
                  </div>

                  <div
                    style={{
                      fontSize: '11px',
                      fontFamily: 'JetBrains Mono, monospace',
                      backgroundColor: '#081217',
                      padding: '5px 8px',
                      borderRadius: '3px',
                      color: '#ff5252',
                      border: '1px solid #1a3644',
                    }}
                  >
                    {f.instruction}
                  </div>

                  <div style={{ fontSize: '11px', color: '#b0bec5' }}>{f.description}</div>
                </div>
              ))
            )}
          </div>

          {/* Log Preview */}
          {rawLog && (
            <div
              style={{
                backgroundColor: '#081217',
                border: '1px solid #1a3644',
                borderRadius: '6px',
                padding: '10px 14px',
              }}
            >
              <div style={{ fontSize: '10px', color: '#78909c', fontWeight: 700, marginBottom: '4px' }}>
                ЛОГ НАЙДЕННЫХ ИНСТРУКЦИЙ (DISASSEMBLER)
              </div>
              <pre
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '11px',
                  color: '#80cbc4',
                  whiteSpace: 'pre-wrap',
                  maxHeight: '90px',
                  overflowY: 'auto',
                  margin: 0,
                }}
              >
                {rawLog}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
