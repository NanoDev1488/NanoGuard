# Журнал сборок NanoGuard

## [2026-10-16] v1.0.0-alpha (Fix zip crate yanked issue)
- **Что изменено**:
  - `crates/nanoguard-fastscan/Cargo.toml`: обновлена зависимость `zip` до версии `9.0.3` с фичей `deflate-flate2` (все версии `zip` от 0.1 до 9.0.2 были отозваны/yanked на crates.io).
  - `crates/nanoguard-fastscan/src/scanner.rs`: адаптировано чтение имени файла через `name_raw()` под сигнатуру `zip 9.0.3`.
- **Результат**: Исправлен выбор версии `zip` для сборки Rust FastScan Core.

## [2026-10-16] v1.0.0-alpha (Fix Actions Workflow)
- **Что изменено**:
  - `crates/nanoguard-fastscan/Cargo.toml`: обновлена зависимость `zip` до актуальной `2.2`.
  - `.github/workflows/build-and-release.yml`: убран флаг `--locked` для сборки Cargo, заменён `npm ci` на `npm install`.
  - `package.json`: добавлена секция `build` для `electron-builder` и скрипты `build:renderer`, `build:electron`.
- **Результат**: Настроена сборка в облаке GitHub Actions.

## [2026-10-16] v1.0.0-alpha
- **Тип**: Первоначальный релиз архитектуры NanoGuard.
- **Что сделано**:
  - Создан нативный C++17 движок (`resources/engine_cpp`) с потоковым парсером классов, модулями Backdoor Hunter и Bytecode Armor.
  - Реализован быстрый параллельный сканер на Rust (`crates/nanoguard-fastscan`) с расчетом энтропии Шеннона.
  - Разработан киберпанк GUI на Electron + React + Vite в фирменном стиле NanoDev (#0f2027, Small Caps, Drag-and-Drop, Call Graph).
  - Настроен GitHub Actions workflow для облачной сборки артефактов без нагрузки на локальный процессор.
- **Статус**: Готов к сборке в GitHub Actions.
