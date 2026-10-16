# Журнал сборок NanoGuard

## [2026-10-16] v1.0.0-alpha (Fix flate2 backend in Rust)
- **Что изменено**:
  - `crates/nanoguard-fastscan/Cargo.toml`: добавлен явный бэкенд `flate2 = { version = "1.0", features = ["rust_backend"] }` и `deflate-flate2-zlib-rs` для `zip 9.0.3`, чтобы устранить ошибку компиляции `You need to choose a zlib backend`.
- **Результат**: Исправлен выбор бэкенда дефлейта для сборки FastScan Core.

## [2026-10-16] v1.0.0-alpha (Fix zip crate yanked issue)
- **Что изменено**:
  - `crates/nanoguard-fastscan/Cargo.toml`: обновлена зависимость `zip` до версии `9.0.3` с фичей `deflate-flate2`.
  - `crates/nanoguard-fastscan/src/scanner.rs`: адаптировано чтение имени файла через `name_raw()` под сигнатуру `zip 9.0.3`.
- **Результат**: Исправлен выбор версии `zip`.

## [2026-10-16] v1.0.0-alpha (Fix Actions Workflow)
- **Что изменено**:
  - `.github/workflows/build-and-release.yml`: убран флаг `--locked` для сборки Cargo, заменён `npm ci` на `npm install`.
  - `package.json`: добавлена секция `build` для `electron-builder` и скрипты `build:renderer`, `build:electron`.
- **Результат**: Настроена сборка в облаке GitHub Actions.

## [2026-10-16] v1.0.0-alpha
- **Тип**: Первоначальный релиз архитектуры NanoGuard.
- **Статус**: Готов к сборке в GitHub Actions.
