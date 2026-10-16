# ɴᴀɴᴏɢᴜᴀʀᴅ (NanoGuard)
### Native Bytecode Armor & Backdoor Hunter

> **Брат-близнец [NanoDecompiler](https://github.com/NanoDev1488/NanoDecompiler)**: нативный движок на C++17 и Rust для тотального аудита чужих Minecraft-плагинов и непробиваемой защиты собственных.

```
                           [ JAR / ZIP / 7z ]
                                   │
                    [ C++17 Streaming Class Parser ]
                                   │
              ┌────────────────────┴────────────────────┐
              ▼                                         ▼
   [ Модуль: Backdoor Hunter ]               [ Модуль: Bytecode Armor ]
 ┌─────────────────────────────┐           ┌─────────────────────────────┐
 │ • Reflection Abuse Scan     │           │ • String Encryption (XOR+)  │
 │ • Web/Socket/RCE Detector   │           │ • Control Flow Disruption   │
 │ • Op/Permission Hijack      │           │ • Metadata Stripping (LVT)  │
 │ • Obfuscation Fingerprint   │           │ • Synthetic Anti-Decompile  │
 └──────────────┬──────────────┘           └──────────────┬──────────────┘
                │                                         │
                ▼                                         ▼
  [ Честный отчёт с офсетами ]              [ Защищённый JAR без оверхеда ]
```

---

## 🛡️ Модуль 1: Backdoor Hunter (Аудит и безопасность)

Многие серверы качают непроверенные «сливы» плагинов, в которых спрятаны бэкдоры. Существующие сканеры просто ищут подстроку `"setOp"` и дают ложные срабатывания.

**NanoGuard делает честный статический анализ:**
- **Детектор RCE и загрузчиков:** Анализ цепочек вызовов `URLClassLoader`, `ProcessBuilder`, `Runtime.getRuntime().exec()`, сетевых сокетов к подозрительным IP/доменам и Discord Webhook exfiltration.
- **Эвристика скрытых команд:** Поиск скрытой логики в `PlayerCommandPreprocessEvent` и `AsyncPlayerChatEvent`, где при вводе секретного пароля вызывается выдача `*` прав или `setOp(true)`.
- **Деобфускация на лету:** Автоматическое снятие тривиальных XOR/Base64 обфускаций констант перед прогоном правил анализа.
- **Точные офсеты в байткоде:** Отчёт содержит точное указание класса, метода, байткод-инструкции (`offset 0x04A2: INVOKEVIRTUAL Player.setOp(Z)`) и контекст вызова.

---

## 🔒 Модуль 2: Bytecode Armor (Защита твоих плагинов)

Защита авторских алгоритмов и систем лицензирования (LimeAuth, NanoATM, NanoClans):
- **Динамическое шифрование строк:** Строки разбиваются на байты и шифруются полиморфным ключом, который генерируется заново для каждого билда (`XOR+`).
- **Ловушки для декомпиляторов (Anti-CFR / Anti-Fernflower / Anti-JADX):**
  - Подмешивание невалидных для декомпиляторов, но легитимных для JVM переходов (`GOTO` в середину защищённого try-catch блока).
  - Генерация синтетических мостовых методов (`ACC_SYNTHETIC | ACC_BRIDGE`), сбивающих JD-GUI и Jadx с толку (`// Internal error`).
- **Вырезание мусора (Metadata Stripping):** Полное удаление `LineNumberTable`, `LocalVariableTable`, `LocalVariableTypeTable`, `SourceFile`. Файл становится на **25–40% компактнее**, а декомпилятор безвозвратно теряет имена всех локальных переменных.

---

## ⚡ Архитектура

- **Core Engine (C++17):** Потоковая обработка классов из JAR-архива. Загружается один класс -> анализируется/защищается -> пишется в выходной поток -> освобождается. Память стабильно `< 64 МБ RAM`.
- **FastScan Core (Rust):** Параллельный аудит с использованием `memmap2`, `rayon` и расчётом энтропии Шеннона.
- **Cyberpunk Dark GUI (Electron + Vite):** Тёмная тема (`#0f2027` фон, бордеры `#2c5364`), Drag & Drop (`ᴘᴇʀᴇᴛᴀꜱʜɪᴛᴇ .ᴊᴀʀ ꜱʏᴜᴅᴀ`), неоновые индикаторы и статус-бар с нулевой телеметрией (`0% TELEMETRY`).

---

## 💻 CLI Использование

```bash
# Аудит подозрительного плагина с выводом в JSON:
nanoguard.exe --audit suspect_plugin.jar --out report.json

# Защита собственного плагина (вырезание LVT, шифрование строк, антидекомпиляция):
nanoguard.exe --protect my_plugin.jar --strip-lvt --encrypt-strings --anti-decompile --out release/my_plugin_armored.jar
```

---

## 👤 Автор и поддержка

- Разработчик: **NanoDev**
- Telegram-канал: [t.me/WineSquad](https://t.me/WineSquad)
- Связь: [t.me/radoqi](https://t.me/radoqi)
- Лицензия: MIT
