# NanoGuard - Project State

- **Версия**: 0.1.0 (Официальный мультиплатформенный релиз)
- **Архитектура**:
  - Native C++17 Core Engine (`resources/engine_cpp`): потоковый парсер классов, CFG, Backdoor Hunter, Bytecode Armor с полным ребилдом JAR (`JarArchive::write_entries` + CRC-32) (Windows, Linux, macOS).
  - Rust FastScan Core (`crates/nanoguard-fastscan`): параллельный сканер с Rayon, memmap2, zip 9.0.3 и энтропией Шеннона (Windows, Linux, macOS).
  - GUI (`electron`, `src`): модульная архитектура в стиле NanoDecompiler (`Titlebar`, `AppHeader`, `AuditView`, `ArmorView`, `ConsoleView`, `CallGraphModal`, `SettingsModal`, `StatusBar`, `Toasts`).
  - Electron Packaging: `extraResources` для бинарников в `resources/engine` (без `spawn ENOENT`), гарантированное сохранение защищенного JAR на диск с кнопкой открытия в проводнике.
  - CI/CD (`.github/workflows/build-and-release.yml`): мультиплатформенная матрица (Win/Linux/Mac), Retina E2E верификация Playwright на macOS, чистые ассеты релиза (без `.blockmap` и `.yml`), авто-публикация с инлайн скриншотами.
- **Окружение**: Windows 10, Intel Pentium P4600, 4 GB RAM.
- **Правила разработки**:
  - Только `cmd.exe /c`, PowerShell категорически запрещен.
  - Сборка тяжелых бинарников через GitHub Actions, чтобы не нагружать слабый ПК.
  - Секреты и токены никогда не сохраняются в файлах репозитория.

## Реализовано (v0.1.0)
1. **Модуль Backdoor Hunter**:
   - Детекция сложного рантайм-патчинга байткода через ASM (`org/objectweb/asm` + `getPlugins` + `getClassLoader` + `defineClass`).
   - Точные индикаторы компрометации (IOC): `RofuYT` (автор бэкдора bStats), кампания Fractureiser (`plugin-config.bin`, C2 домены).
   - Детекция RCE (`ProcessBuilder`, `Runtime.exec`), `URLClassLoader` дропперов, ForceOP (`Player.setOp(true)`), эксфильтрации через Discord/Telegram.
   - Кража учетных данных браузеров (Login Data, Cookies, Discord leveldb) и закрепление в системе (schtasks, Run, Startup).
2. **Модуль Bytecode Armor & ZIP движок**:
   - Встроенная библиотека `miniz` (C99): корректное чтение и запись сжатых Deflate-архивов JAR.
   - Единый метка-файл защиты: `META-INF/NANOGUARD.INF`.
   - 100% совместимость с JVM (Java 8 - 21): вырезание `LineNumberTable`, `LocalVariableTable`, `SourceFile`, `MethodParameters` без нарушения байткода и StackMapTable.
   - Верификация в CI: запуск защищенного плагина на реальном сервере PaperMC 1.20.4.
3. **GUI & Релиз**:
   - Модульный UI в стиле NanoDecompiler, терминал логов в реальном времени, модалка настроек.
   - Четкие Retina 2x скриншоты интерфейса в `docs/screenshots/`.
   - Чистый GitHub Release v0.1.0 без мусорных файлов (`.blockmap`, `builder-debug.yml`).
