# NanoGuard - Project State

- **Версия**: 1.0.0-alpha
- **Архитектура**:
  - Native C++17 Core Engine (`resources/engine_cpp`): стриминговый парсер классов, CFG, Backdoor Hunter, Bytecode Armor.
  - Rust FastScan Core (`crates/nanoguard-fastscan`): параллельный сканер с Rayon, memmap2 и энтропией Шеннона.
  - GUI (`electron`, `src`): Vite + React + TypeScript, безрамочное окно #0f2027, Small Caps.
  - CI/CD (`.github/workflows/build-and-release.yml`): сборка бинарников на GitHub Actions.
- **Окружение**: Windows 10, Intel Pentium P4600, 4 GB RAM.
- **Правила разработки**:
  - Только `cmd.exe /c`, PowerShell категорически запрещен.
  - Сборка тяжелых бинарников через GitHub Actions, чтобы не нагружать слабый процессор.
  - Секреты и токены никогда не сохраняются в файлах репозитория.

## Реализовано (v1.0.0-alpha)
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
3. **Интерфейс & CLI**:
   - CLI с флагами `--audit`, `--protect`, `--strip-lvt`, `--encrypt-strings`, `--anti-decompile`.
   - Киберпанк UI с Drag & Drop (`ᴘᴇʀᴇᴛᴀꜱʜɪᴛᴇ .ᴊᴀʀ ꜱʏᴜᴅᴀ`), статус-баром и интерактивным графом вызовов.
