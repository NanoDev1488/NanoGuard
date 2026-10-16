# NanoGuard - Project State

- **Версия**: 0.1.0 (Официальный первый мультиплатформенный релиз)
- **Архитектура**:
  - Native C++17 Core Engine (`resources/engine_cpp`): стриминговый парсер классов, CFG, Backdoor Hunter, Bytecode Armor (Windows, Linux, macOS).
  - Rust FastScan Core (`crates/nanoguard-fastscan`): параллельный сканер с Rayon, memmap2, zip 9.0.3 и энтропией Шеннона (Windows, Linux, macOS).
  - GUI (`electron`, `src`): Vite + React + TypeScript, безрамочное окно #0f2027, Small Caps.
  - CI/CD (`.github/workflows/build-and-release.yml`): мультиплатформенная матрица (Win/Linux/Mac), Playwright E2E верификация со скриншотами на macOS, авто-публикация GitHub Release v0.1.0.
- **Окружение**: Windows 10, Intel Pentium P4600, 4 GB RAM.
- **Правила разработки**:
  - Только `cmd.exe /c`, PowerShell категорически запрещен.
  - Сборка тяжелых бинарников через GitHub Actions, чтобы не нагружать процессор.
  - Секреты и токены никогда не сохраняются в файлах репозитория.

## Реализовано (v0.1.0)
1. **Модуль Backdoor Hunter**:
   - Детекция RCE (`ProcessBuilder`, `Runtime.exec`), `URLClassLoader` дропперов.
   - Детекция перехвата прав: `Player.setOp(true)`, PermissionAttachment `*`.
   - Эвристика скрытых команд в `AsyncPlayerChatEvent` / `PlayerCommandPreprocessEvent`.
   - Распознавание обфускаторов: Allatori, Zelix, Stringer, ProGuard.
   - Точные шестнадцатеричные смещения инструкций и контекстные сниппеты.
2. **Модуль Bytecode Armor**:
   - Динамическое шифрование строк полиморфным ключом билда (`XOR+`).
   - Anti-decompiler ловушки (`ACC_SYNTHETIC | ACC_BRIDGE`, GOTO dead jumps).
   - Вырезание отладочного мусора (`LineNumberTable`, `LocalVariableTable`, `SourceFile`).
3. **Мультиплатформенность & Релизы**:
   - Сборка GUI: Windows Portable EXE, Linux AppImage, macOS DMG/ZIP.
   - Сборка нативного C++ и Rust CLI под Windows, Linux и macOS.
   - Автоматические E2E тесты Playwright на macOS со снятием скриншотов GUI для релиза.
