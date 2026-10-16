# Журнал сборок NanoGuard

## [2026-10-16] v1.0.0-alpha
- **Тип**: Первоначальный релиз архитектуры NanoGuard.
- **Что сделано**:
  - Создан нативный C++17 движок (`resources/engine_cpp`) с потоковым парсером классов, модулями Backdoor Hunter и Bytecode Armor.
  - Реализован быстрый параллельный сканер на Rust (`crates/nanoguard-fastscan`) с расчетом энтропии Шеннона.
  - Разработан киберпанк GUI на Electron + React + Vite в фирменном стиле NanoDev (#0f2027, Small Caps, Drag-and-Drop, Call Graph).
  - Настроен GitHub Actions workflow для облачной сборки артефактов без нагрузки на локальный процессор.
- **Статус**: Готов к сборке в GitHub Actions.
