# Журнал сборок NanoGuard

## [2026-10-16] v0.1.0 - Официальный релиз (Multiplatform GUI & CLI)
- **Что изменено**:
  - Версия синхронизирована до `0.1.0` во всех конфигурациях (`package.json`, `Cargo.toml`, `CMakeLists.txt`, `main.cpp`, `App.tsx`, `README.md`).
  - `.github/workflows/build-and-release.yml`: добавлена мультиплатформенная матрица сборки (Windows x64, Linux x64, macOS x64).
  - Интегрирована автоматическая Playwright E2E верификация GUI на macOS со снятием полноразмерных скриншотов (`scripts/verify_gui.js`).
  - Добавлена авто-публикация GitHub Release `v0.1.0` с прикреплением скриншотов прямо в текст релиза и загрузкой бинарников (Portable EXE, AppImage, DMG, нативные CLI).
- **Результат**: Подготовлен и запущен полный мультиплатформенный цикл сборки и релиза.

## [2026-10-16] v1.0.0-alpha (Fix flate2 backend in Rust)
- **Что изменено**:
  - `crates/nanoguard-fastscan/Cargo.toml`: добавлен явный бэкенд `flate2 = { version = "1.0", features = ["rust_backend"] }` и `deflate-flate2-zlib-rs` для `zip 9.0.3`.
- **Результат**: Устранена ошибка zlib backend.

## [2026-10-16] v1.0.0-alpha (Fix zip crate yanked issue)
- **Что изменено**:
  - `crates/nanoguard-fastscan/Cargo.toml`: обновлена зависимость `zip` до `9.0.3`.
  - `crates/nanoguard-fastscan/src/scanner.rs`: адаптировано чтение через `name_raw()`.
- **Результат**: Исправлен выбор версии `zip`.
