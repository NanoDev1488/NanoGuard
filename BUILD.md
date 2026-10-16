# Сборка NanoGuard

Сборка оптимизирована для слабого ПК (4 ГБ ОЗУ, 2-ядерный процессор).

## 1. Сборка через GitHub Actions (Рекомендуется)
Каждый пуш или создание тега в ветку `main` автоматически собирает все артефакты в облаке GitHub Actions:
- `nanoguard.exe` (нативный C++17 движок)
- `nanoguard-fastscan.exe` (Rust параллельный сканер)
- `NanoGuard-Portable.exe` (Electron Windows сборка)

Готовые бинарники доступны во вкладке **Actions -> Artifacts**.

## 2. Локальная сборка (при наличии установленных инструментов)

### C++17 Core Engine
```cmd
cd /d resources\engine_cpp
mkdir build && cd build
cmake -G "Ninja" -DCMAKE_BUILD_TYPE=Release ..
cmake --build . -j 1
```

### Rust FastScan
```cmd
cd /d crates\nanoguard-fastscan
cargo build --release
```

### Electron GUI
```cmd
npm install
npm run build
```
