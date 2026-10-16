# Журнал сборок NanoGuard

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
