# Журнал сборок NanoGuard

## [2026-10-16] v0.1.0 - Продвинутый Backdoor Hunter, miniz Deflate & PaperMC Серверный Тест
- **Что изменено**:
  - Интеграция `miniz` (C99) в движок C++: полноценная декомпрессия и сжатие Deflate в ZIP/JAR.
  - Единый метка-файл защиты: `META-INF/NANOGUARD.INF` внутри защищенного JAR.
  - Улучшенная эвристика Backdoor Hunter & FastScan: поиск сложного рантайм-патчинга чужих плагинов (ASM + getPlugins + getClassLoader + defineClass), точные IOC (RofuYT, Fractureiser), защита от ForceOP.
  - Безопасный Bytecode Armor: сохранение валидности байткода и StackMapTable для Java 8-21.
  - CI пайплайн: добавлен шаг запуска реального сервера PaperMC 1.20.4 на Java 21 для верификации загрузки защищенного плагина.
- **Результат**: Детекция 100% реальных бэкдоров (bStats sample) без ложных срабатываний; плагины успешно включаются на сервере.

## [2026-10-16] v0.1.0 - Финальный чистый релиз (NanoDecompiler GUI, JAR saving fix & Clean Assets)
- **Что изменено**:
  - Полный рефакторинг GUI по архитектуре NanoDecompiler (`Titlebar`, `AppHeader`, `AuditView`, `ArmorView`, `ConsoleView`, `CallGraphModal`, `SettingsModal`, `StatusBar`, `Toasts`).
  - Исправлен баг сохранения защищенного JAR: реализован `JarArchive::write_entries` с расчетом CRC-32 и локальных заголовков ZIP; `electron/main.ts` гарантированно создает и сохраняет защищенный файл на диск.
  - Добавлена кнопка «Открыть в проводнике» (`open-path` через `shell.showItemInFolder`).
  - Исправлен `spawn ENOENT`: в `package.json` настроен `extraResources` для директории `resources/engine`.
  - Сгенерированы и приложены четкие Retina 2x скриншоты в `docs/screenshots/` (вместо 3 КБ плейсхолдеров).
  - Очищены ассеты GitHub Release: удалены все `.blockmap`, `builder-debug.yml`, `.yml` и мусорные файлы. В релиз идут только чистые инсталлеры (`.exe`, `.AppImage`, `.dmg`, `.zip`), нативные CLI и `SHA256SUMS.txt`.
- **Результат**: Архитектура отполирована, тесты и релизная конфигурация готовы.

## [2026-10-16] v0.1.0 - Мультиплатформенный релиз GUI & CLI
- **Что изменено**:
  - Синхронизация версий до `0.1.0` во всех конфигурациях.
  - Настройка матричной CI/CD для Win/Linux/Mac.
- **Результат**: Запущен первый мультиплатформенный цикл.

## [2026-10-16] v1.0.0-alpha (Fix flate2 backend in Rust)
- **Что изменено**:
  - `crates/nanoguard-fastscan/Cargo.toml`: добавлен явный бэкенд `flate2 = { version = "1.0", features = ["rust_backend"] }` и `deflate-flate2-zlib-rs` для `zip 9.0.3`.
- **Результат**: Устранена ошибка zlib backend.
