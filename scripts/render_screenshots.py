import os
from PIL import Image, ImageDraw, ImageFont

OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'docs', 'screenshots')
os.makedirs(OUT_DIR, exist_ok=True)

WIDTH = 1140
HEIGHT = 760

# Colors
BG_DARK = (7, 15, 20)
BG_PANEL = (13, 28, 36)
BG_CARD = (18, 35, 44)
BG_INPUT = (8, 18, 23)
BORDER_DARK = (26, 54, 68)
BORDER_CARD = (30, 60, 77)

NEON_CYAN = (0, 229, 255)
NEON_GREEN = (0, 230, 118)
NEON_RED = (255, 23, 68)
NEON_AMBER = (255, 171, 0)

TEXT_WHITE = (224, 242, 241)
TEXT_MUTED = (136, 160, 176)
TEXT_DIM = (96, 125, 139)
TEXT_CYAN = (128, 203, 196)

def get_font(size, bold=False):
    # Try Windows system fonts
    font_names = [
        "C:\\Windows\\Fonts\\segoeuib.ttf" if bold else "C:\\Windows\\Fonts\\segoeui.ttf",
        "C:\\Windows\\Fonts\\consola.ttf",
        "C:\\Windows\\Fonts\\arial.ttf"
    ]
    for fn in font_names:
        if os.path.exists(fn):
            try:
                return ImageFont.truetype(fn, size)
            except:
                pass
    return ImageFont.load_default()

font_title = get_font(13, bold=True)
font_badge = get_font(10, bold=True)
font_tab = get_font(12, bold=True)
font_hero = get_font(15, bold=True)
font_metric_num = get_font(22, bold=True)
font_metric_lbl = get_font(10, bold=True)
font_card_title = get_font(13, bold=True)
font_code = get_font(11, bold=False)
font_sub = get_font(11, bold=False)
font_small = get_font(10, bold=False)

def draw_base_window(title_suffix=""):
    im = Image.new('RGB', (WIDTH, HEIGHT), BG_DARK)
    d = ImageDraw.Draw(im)

    # 1. Titlebar (38px)
    d.rectangle([0, 0, WIDTH, 38], fill=(7, 15, 20))
    d.line([(0, 38), (WIDTH, 38)], fill=BORDER_DARK, width=1)

    # Titlebar items
    d.text((14, 11), "🛡️", fill=NEON_CYAN, font=font_title)
    d.text((38, 11), "NANOGUARD", fill=TEXT_WHITE, font=font_title)
    d.rectangle([130, 10, 175, 27], fill=(0, 40, 50), outline=(0, 150, 180), width=1)
    d.text((135, 12), "v0.1.0", fill=NEON_CYAN, font=font_badge)
    d.text((186, 13), "[ NATIVE C++17 ARMOR & FASTSCAN ]", fill=TEXT_DIM, font=font_small)

    # System ready indicator
    d.ellipse([900, 16, 908, 24], fill=NEON_GREEN)
    d.text((915, 12), "SYSTEM READY", fill=NEON_GREEN, font=font_badge)

    # Window controls
    d.text((1045, 10), "—", fill=TEXT_MUTED, font=font_title)
    d.text((1075, 10), "▢", fill=TEXT_MUTED, font=font_title)
    d.text((1105, 10), "✕", fill=TEXT_MUTED, font=font_title)

    # 2. Statusbar (26px) at bottom
    sb_y = HEIGHT - 26
    d.rectangle([0, sb_y, WIDTH, HEIGHT], fill=(7, 15, 20))
    d.line([(0, sb_y), (WIDTH, sb_y)], fill=BORDER_DARK, width=1)

    d.text((14, sb_y + 6), "CPU:", fill=TEXT_DIM, font=font_small)
    d.text((44, sb_y + 6), "1.2%", fill=NEON_GREEN, font=font_badge)

    d.text((80, sb_y + 6), "RAM:", fill=TEXT_DIM, font=font_small)
    d.text((112, sb_y + 6), "42 MB", fill=NEON_CYAN, font=font_badge)

    d.text((165, sb_y + 6), "0% TELEMETRY (OFFLINE)", fill=TEXT_CYAN, font=font_small)
    d.text((320, sb_y + 6), "ENGINE: CPP NATIVE", fill=TEXT_DIM, font=font_small)

    d.text((990, sb_y + 6), "NanoDev · t.me/WineSquad", fill=TEXT_CYAN, font=font_small)

    return im, d

def draw_header_tabs(d, active_tab='audit'):
    # Header container (46px)
    d.rectangle([0, 39, WIDTH, 84], fill=(10, 21, 29))
    d.line([(0, 84), (WIDTH, 84)], fill=BORDER_DARK, width=1)

    # Audit Tab
    if active_tab == 'audit':
        d.rectangle([14, 46, 200, 78], fill=(19, 39, 51), outline=NEON_CYAN, width=1)
        d.text((24, 53), "🛡️ [ ʙᴀᴄᴋᴅᴏᴏʀ ʜᴜɴᴛᴇʀ ]", fill=NEON_CYAN, font=font_tab)
        # Threat badge
        d.rectangle([175, 52, 192, 70], fill=NEON_RED)
        d.text((180, 53), "4", fill=(255, 255, 255), font=font_badge)
    else:
        d.rectangle([14, 46, 175, 78], fill=BG_DARK, outline=(0,0,0,0))
        d.text((24, 53), "🛡️ [ ʙᴀᴄᴋᴅᴏᴏʀ ʜᴜɴᴛᴇʀ ]", fill=TEXT_MUTED, font=font_tab)

    # Protect Tab
    if active_tab == 'protect':
        d.rectangle([210, 46, 370, 78], fill=(19, 39, 51), outline=NEON_GREEN, width=1)
        d.text((220, 53), "🔒 [ ʙʏᴛᴇᴄᴏᴅᴇ ᴀʀᴍᴏʀ ]", fill=NEON_GREEN, font=font_tab)
    else:
        d.rectangle([190, 46, 350, 78], fill=BG_DARK, outline=(0,0,0,0))
        d.text((200, 53), "🔒 [ ʙʏᴛᴇᴄᴏᴅᴇ ᴀʀᴍᴏʀ ]", fill=TEXT_MUTED, font=font_tab)

    # Console Tab
    d.rectangle([365, 46, 500, 78], fill=BG_DARK, outline=(0,0,0,0))
    d.text((375, 53), "📟 [ ʟɪᴠᴇ ᴄᴏɴꜱᴏʟᴇ ]", fill=TEXT_MUTED, font=font_tab)

    # Right side: Plugin name pill & settings button
    d.rectangle([820, 49, 1010, 75], fill=(16, 34, 44), outline=BORDER_DARK, width=1)
    d.text((830, 54), "📦 suspect_plugin.jar", fill=TEXT_CYAN, font=font_code)

    d.rectangle([1020, 49, 1125, 75], fill=(16, 34, 44), outline=BORDER_DARK, width=1)
    d.text((1032, 54), "⚙️ [ ɴᴀꜱᴛʀᴏʏᴋɪ ]", fill=TEXT_MUTED, font=font_badge)

def render_audit_screenshot():
    im, d = draw_base_window()
    draw_header_tabs(d, active_tab='audit')

    # Hero Drop Zone
    d.rectangle([14, 96, WIDTH - 14, 186], fill=BG_PANEL, outline=BORDER_DARK, width=1)
    d.text((WIDTH//2 - 12, 106), "🛡️", fill=NEON_CYAN, font=font_hero)
    d.text((WIDTH//2 - 80, 130), "suspect_plugin.jar", fill=NEON_CYAN, font=font_hero)
    d.text((WIDTH//2 - 190, 154), "C:\\Users\\nanodev\\Downloads\\suspect_plugin.jar (1.42 MB)", fill=TEXT_CYAN, font=font_code)

    # Action buttons inside hero
    d.rectangle([WIDTH//2 - 130, 166, WIDTH//2 - 10, 182], fill=(20, 42, 54), outline=BORDER_DARK, width=1)
    d.text((WIDTH//2 - 120, 168), "📁 Выбрать файл", fill=TEXT_WHITE, font=font_small)

    d.rectangle([WIDTH//2, 166, WIDTH//2 + 150, 182], fill=NEON_CYAN)
    d.text((WIDTH//2 + 10, 168), "⚡ СТАТИЧЕСКИЙ АУДИТ", fill=(7, 15, 20), font=font_badge)

    # 4 Cyber Metric Cards
    card_w = (WIDTH - 28 - 30) // 4
    cards_y = 196

    # 1. Total classes
    x1 = 14
    d.rectangle([x1, cards_y, x1 + card_w, cards_y + 70], fill=BG_PANEL, outline=BORDER_DARK, width=1)
    d.text((x1 + 12, cards_y + 8), "КЛАССОВ В JAR", fill=TEXT_MUTED, font=font_metric_lbl)
    d.text((x1 + 12, cards_y + 24), "24", fill=TEXT_WHITE, font=font_metric_num)
    d.text((x1 + 12, cards_y + 52), "5 пакетов · Полный разбор CFG", fill=TEXT_DIM, font=font_small)

    # 2. Obfuscator
    x2 = x1 + card_w + 10
    d.rectangle([x2, cards_y, x2 + card_w, cards_y + 70], fill=BG_PANEL, outline=BORDER_DARK, width=1)
    d.text((x2 + 12, cards_y + 8), "ОБФУСКАЦИЯ", fill=TEXT_MUTED, font=font_metric_lbl)
    d.text((x2 + 12, cards_y + 26), "Zelix / Stringer", fill=NEON_AMBER, font=font_card_title)
    d.text((x2 + 12, cards_y + 52), "Сигнатурный отпечаток найден", fill=TEXT_DIM, font=font_small)

    # 3. Entropy
    x3 = x2 + card_w + 10
    d.rectangle([x3, cards_y, x3 + card_w, cards_y + 70], fill=BG_PANEL, outline=BORDER_DARK, width=1)
    d.text((x3 + 12, cards_y + 8), "ЭНТРОПИЯ ШЕННОНА", fill=TEXT_MUTED, font=font_metric_lbl)
    d.text((x3 + 12, cards_y + 24), "7.68", fill=NEON_RED, font=font_metric_num)
    d.text((x3 + 70, cards_y + 32), "/ 8.00", fill=TEXT_DIM, font=font_small)
    d.text((x3 + 12, cards_y + 52), "Скрытые зашифрованные пейлоады", fill=TEXT_DIM, font=font_small)

    # 4. Threat Score
    x4 = x3 + card_w + 10
    d.rectangle([x4, cards_y, x4 + card_w, cards_y + 70], fill=BG_PANEL, outline=BORDER_DARK, width=1)
    d.text((x4 + 12, cards_y + 8), "ИНДЕКС ОПАСНОСТИ", fill=TEXT_MUTED, font=font_metric_lbl)
    d.text((x4 + 12, cards_y + 24), "85", fill=NEON_RED, font=font_metric_num)
    d.text((x4 + 48, cards_y + 32), "/ 100", fill=TEXT_DIM, font=font_small)
    d.rectangle([x4 + card_w - 82, cards_y + 10, x4 + card_w - 12, cards_y + 28], fill=(60, 15, 25), outline=NEON_RED, width=1)
    d.text((x4 + card_w - 76, cards_y + 13), "КРИТИЧНО", fill=NEON_RED, font=font_badge)
    d.text((x4 + 12, cards_y + 52), "Обнаружено 4 бэкдор-сигнатуры", fill=TEXT_DIM, font=font_small)

    # Filter Toolbar
    ft_y = 276
    d.rectangle([14, ft_y, WIDTH - 14, ft_y + 34], fill=BG_PANEL, outline=BORDER_DARK, width=1)
    d.text((26, ft_y + 9), "🔍 Поиск по классам, методам, инструкциям...", fill=TEXT_MUTED, font=font_sub)

    # Severity buttons
    d.rectangle([WIDTH - 240, ft_y + 6, WIDTH - 195, ft_y + 28], fill=(20, 42, 54), outline=NEON_CYAN, width=1)
    d.text((WIDTH - 230, ft_y + 9), "ВСЕ", fill=NEON_CYAN, font=font_badge)

    d.rectangle([WIDTH - 190, ft_y + 6, WIDTH - 120, ft_y + 28], fill=BG_DARK, outline=BORDER_DARK, width=1)
    d.text((WIDTH - 180, ft_y + 9), "CRITICAL", fill=NEON_RED, font=font_badge)

    d.rectangle([WIDTH - 115, ft_y + 6, WIDTH - 60, ft_y + 28], fill=BG_DARK, outline=BORDER_DARK, width=1)
    d.text((WIDTH - 105, ft_y + 9), "HIGH", fill=NEON_AMBER, font=font_badge)

    # Threat Findings List
    findings_y = 318
    findings = [
        ("CRITICAL", "ForceOP / Backdoor Hijack", "ru/nanodev/exploit/ChatListener#onChat", "0x04A2: invokevirtual org/bukkit/entity/Player.setOp(Z)", "Скрытая выдача прав оператора (OP) при отправке секретного триггера в чат.", NEON_RED),
        ("CRITICAL", "Remote Payload Download (Dropper)", "ru/nanodev/exploit/ClassLoaderUtil#loadRemote", "0x0200: new java/net/URLClassLoader", "Динамическая загрузка вредоносного jar из сети в обход проверки антивируса.", NEON_RED),
        ("HIGH", "Data Exfiltration (Discord Webhook)", "ru/nanodev/exploit/WebHookSender#sendData", "0x0030: ldc \"https://discord.com/api/webhooks/112233...\"", "Утечка логов сервера, конфигурации и паролей на внешний вебхук.", NEON_AMBER),
        ("HIGH", "RCE / Shell Execution", "ru/nanodev/exploit/PayloadExecutor#exec", "0x00D4: invokevirtual java/lang/Runtime.exec(Ljava/lang/String;)Ljava/lang/Process;", "Прямой запуск команд командной строки хост-системы Windows/Linux.", NEON_AMBER),
    ]

    cur_y = findings_y
    for sev, cat, loc, inst, desc, color in findings:
        d.rectangle([14, cur_y, WIDTH - 14, cur_y + 86], fill=BG_CARD, outline=BORDER_CARD, width=1)
        # Left severity line
        d.rectangle([14, cur_y, 18, cur_y + 86], fill=color)

        # Badge & Category
        d.rectangle([28, cur_y + 8, 88, cur_y + 24], fill=(40, 15, 20) if color == NEON_RED else (40, 30, 10), outline=color, width=1)
        d.text((34, cur_y + 10), sev, fill=color, font=font_badge)
        d.text((98, cur_y + 8), cat, fill=TEXT_WHITE, font=font_card_title)

        # Call Graph Action Button
        d.rectangle([WIDTH - 150, cur_y + 8, WIDTH - 26, cur_y + 28], fill=(16, 34, 44), outline=NEON_CYAN, width=1)
        d.text((WIDTH - 140, cur_y + 11), "[ 🌐 ГРАФ ВЫЗОВОВ ]", fill=NEON_CYAN, font=font_badge)

        # Location
        d.text((28, cur_y + 28), f"Локация: {loc}", fill=TEXT_MUTED, font=font_code)

        # Instruction snippet
        d.rectangle([28, cur_y + 44, WIDTH - 26, cur_y + 64], fill=BG_INPUT, outline=BORDER_DARK, width=1)
        d.text((36, cur_y + 48), inst, fill=(255, 82, 82), font=font_code)

        # Description
        d.text((28, cur_y + 68), desc, fill=(176, 190, 197), font=font_small)

        cur_y += 94

    im.save(os.path.join(OUT_DIR, 'nanoguard_audit.png'))
    print(f"[+] Rendered Retina nanoguard_audit.png ({os.path.getsize(os.path.join(OUT_DIR, 'nanoguard_audit.png'))} bytes)")

def render_protect_screenshot():
    im, d = draw_base_window()
    draw_header_tabs(d, active_tab='protect')

    # Hero Drop Zone
    d.rectangle([14, 96, WIDTH - 14, 186], fill=BG_PANEL, outline=BORDER_DARK, width=1)
    d.text((WIDTH//2 - 12, 106), "🔒", fill=NEON_GREEN, font=font_hero)
    d.text((WIDTH//2 - 95, 130), "LimeAuth-v2.1.0.jar", fill=NEON_GREEN, font=font_hero)
    d.text((WIDTH//2 - 210, 154), "C:\\Users\\nanodev\\Projects\\LimeAuth\\target\\LimeAuth-v2.1.0.jar (450 KB)", fill=TEXT_CYAN, font=font_code)

    # Protection Options Container
    opts_y = 196
    d.rectangle([14, opts_y, WIDTH - 14, opts_y + 280], fill=BG_PANEL, outline=BORDER_DARK, width=1)
    d.text((26, opts_y + 12), "МОДУЛИ ЗАЩИТЫ (BYTECODE ARMOR PIPELINE)", fill=NEON_GREEN, font=font_card_title)
    d.text((WIDTH - 210, opts_y + 14), "NATIVE C++17 OPTIMIZED", fill=TEXT_DIM, font=font_code)

    # 4 Modules (2x2 Grid)
    box_w = (WIDTH - 28 - 24) // 2
    b1_x = 24
    b2_x = b1_x + box_w + 12

    # Module 1
    d.rectangle([b1_x, opts_y + 36, b1_x + box_w, opts_y + 94], fill=BG_CARD, outline=BORDER_CARD, width=1)
    d.rectangle([b1_x + 10, opts_y + 44, b1_x + 22, opts_y + 56], fill=NEON_GREEN)
    d.text((b1_x + 30, opts_y + 42), "Вырезание отладочного мусора (LVT/LineNumbers)", fill=TEXT_WHITE, font=font_title)
    d.text((b1_x + 30, opts_y + 60), "Удаляет таблицы локальных переменных и имена. Снижает вес JAR до 40% и ломает декомпиляцию.", fill=TEXT_MUTED, font=font_small)

    # Module 2
    d.rectangle([b2_x, opts_y + 36, b2_x + box_w, opts_y + 94], fill=BG_CARD, outline=BORDER_CARD, width=1)
    d.rectangle([b2_x + 10, opts_y + 44, b2_x + 22, opts_y + 56], fill=NEON_GREEN)
    d.text((b2_x + 30, opts_y + 42), "Динамическое шифрование строк (Polymorphic XOR+)", fill=TEXT_WHITE, font=font_title)
    d.text((b2_x + 30, opts_y + 60), "Строковые литералы разбиваются на байты и шифруются уникальным ключом билда.", fill=TEXT_MUTED, font=font_small)

    # Module 3
    d.rectangle([b1_x, opts_y + 104, b1_x + box_w, opts_y + 162], fill=BG_CARD, outline=BORDER_CARD, width=1)
    d.rectangle([b1_x + 10, opts_y + 112, b1_x + 22, opts_y + 124], fill=NEON_GREEN)
    d.text((b1_x + 30, opts_y + 110), "Ловушки для декомпиляторов (Anti-CFR / Jadx / Fernflower)", fill=TEXT_WHITE, font=font_title)
    d.text((b1_x + 30, opts_y + 128), "Инъекция синтетических мостовых методов (ACC_SYNTHETIC | ACC_BRIDGE) и циклов перехода.", fill=TEXT_MUTED, font=font_small)

    # Module 4
    d.rectangle([b2_x, opts_y + 104, b2_x + box_w, opts_y + 162], fill=BG_CARD, outline=BORDER_CARD, width=1)
    d.rectangle([b2_x + 10, opts_y + 112, b2_x + 22, opts_y + 124], fill=NEON_GREEN)
    d.text((b2_x + 30, opts_y + 110), "Сохранение Bukkit / Spigot сигнатур", fill=TEXT_WHITE, font=font_title)
    d.text((b2_x + 30, opts_y + 128), "Защита не ломает @EventHandler методы, plugin.yml и публичные команды плагина.", fill=TEXT_MUTED, font=font_small)

    # Destination Output Path Box
    d.text((24, opts_y + 176), "ПУТЬ СОХРАНЕНИЯ ЗАЩИЩЕННОГО JAR:", fill=TEXT_MUTED, font=font_badge)
    d.rectangle([24, opts_y + 192, WIDTH - 120, opts_y + 220], fill=BG_INPUT, outline=BORDER_DARK, width=1)
    d.text((34, opts_y + 199), "C:\\Users\\nanodev\\Projects\\LimeAuth\\target\\LimeAuth-v2.1.0_protected.jar", fill=TEXT_CYAN, font=font_code)

    d.rectangle([WIDTH - 110, opts_y + 192, WIDTH - 24, opts_y + 220], fill=(20, 42, 54), outline=BORDER_CARD, width=1)
    d.text((WIDTH - 96, opts_y + 199), "Обзор...", fill=TEXT_WHITE, font=font_small)

    # Big Action Button
    d.rectangle([24, opts_y + 230, WIDTH - 24, opts_y + 268], fill=NEON_GREEN)
    d.text((WIDTH//2 - 130, opts_y + 242), "🔒 ЗАЩИТИТЬ ПЛАГИН И СОХРАНИТЬ JAR", fill=(7, 15, 20), font=font_card_title)

    # Result Box (Success Green)
    res_y = 488
    d.rectangle([14, res_y, WIDTH - 14, res_y + 130], fill=BG_PANEL, outline=NEON_GREEN, width=1)
    d.text((26, res_y + 12), "✓  ПЛАГИН УСПЕШНО ЗАЩИЩЕН И СОХРАНЕН НА ДИСК", fill=NEON_GREEN, font=font_card_title)

    # 4 Result metric cards
    res_w = (WIDTH - 28 - 30) // 4
    for idx, (lbl, val, col) in enumerate([
        ("Удалено LVT атрибутов", "142", TEXT_WHITE),
        ("Зашифровано строк", "94", NEON_CYAN),
        ("Внедрено ловушек", "34", NEON_AMBER),
        ("Экономия размера", "-27.7%", NEON_GREEN)
    ]):
        rx = 24 + idx * (res_w + 10)
        d.rectangle([rx, res_y + 36, rx + res_w, res_y + 80], fill=BG_CARD, outline=BORDER_CARD, width=1)
        d.text((rx + 10, res_y + 42), lbl, fill=TEXT_MUTED, font=font_small)
        d.text((rx + 10, res_y + 56), val, fill=col, font=font_hero)

    # File location row with Explorer button
    d.rectangle([24, res_y + 90, WIDTH - 24, res_y + 118], fill=BG_INPUT, outline=BORDER_DARK, width=1)
    d.text((34, res_y + 96), "Файл: C:\\Users\\nanodev\\Projects\\LimeAuth\\target\\LimeAuth-v2.1.0_protected.jar", fill=TEXT_CYAN, font=font_code)

    d.rectangle([WIDTH - 190, res_y + 93, WIDTH - 30, res_y + 115], fill=(20, 42, 54), outline=NEON_GREEN, width=1)
    d.text((WIDTH - 180, res_y + 96), "📂 Открыть в проводнике", fill=NEON_GREEN, font=font_badge)

    im.save(os.path.join(OUT_DIR, 'nanoguard_protect.png'))
    print(f"[+] Rendered Retina nanoguard_protect.png ({os.path.getsize(os.path.join(OUT_DIR, 'nanoguard_protect.png'))} bytes)")

def render_callgraph_screenshot():
    # Render base with modal overlay
    im, d = draw_base_window()
    draw_header_tabs(d, active_tab='audit')

    # Dim overlay
    overlay = Image.new('RGBA', (WIDTH, HEIGHT), (5, 12, 16, 215))
    im.paste(overlay, (0, 0), overlay)
    d = ImageDraw.Draw(im)

    # Modal Box (720x460)
    mw, mh = 720, 480
    mx = (WIDTH - mw) // 2
    my = (HEIGHT - mh) // 2

    d.rectangle([mx, my, mx + mw, my + mh], fill=(10, 21, 29), outline=NEON_CYAN, width=1)

    # Modal Header
    d.rectangle([mx, my, mx + mw, my + 42], fill=(7, 15, 20), outline=BORDER_DARK, width=1)
    d.text((mx + 16, my + 12), "🌐  ИНТЕРАКТИВНЫЙ ГРАФ ВЫЗОВОВ (CALL FLOW GRAPH)", fill=NEON_CYAN, font=font_title)
    d.rectangle([mx + mw - 110, my + 10, mx + mw - 40, my + 30], fill=(50, 15, 20), outline=NEON_RED, width=1)
    d.text((mx + mw - 102, my + 13), "CRITICAL", fill=NEON_RED, font=font_badge)
    d.text((mx + mw - 26, my + 11), "✕", fill=TEXT_MUTED, font=font_title)

    # Modal description
    d.text((mx + 20, my + 54), "Цепочка передачи управления от внешнего триггера к точке компрометации сервера:", fill=TEXT_MUTED, font=font_sub)

    # Container for nodes
    ny = my + 78
    d.rectangle([mx + 20, ny, mx + mw - 20, my + mh - 58], fill=(7, 15, 20), outline=BORDER_DARK, width=1)

    # Node 1: Entry Trigger (Cyan)
    n1_y = ny + 14
    d.rectangle([mx + 36, n1_y, mx + mw - 36, n1_y + 64], fill=BG_CARD, outline=BORDER_CARD, width=1)
    d.rectangle([mx + 36, n1_y, mx + 40, n1_y + 64], fill=NEON_CYAN)
    d.text((mx + 50, n1_y + 10), "ENTRY POINT // ВНЕШНИЙ ТРИГГЕР", fill=NEON_CYAN, font=font_badge)
    d.text((mx + 50, n1_y + 26), "org.bukkit.event.player.AsyncPlayerChatEvent", fill=TEXT_WHITE, font=font_title)
    d.text((mx + 50, n1_y + 44), "Слушатель сообщений чата в потоке событий сервера", fill=TEXT_MUTED, font=font_small)

    # Arrow 1
    d.text((mx + mw//2 - 6, n1_y + 72), "▼", fill=TEXT_DIM, font=font_sub)

    # Node 2: Dispatcher (Amber)
    n2_y = n1_y + 96
    d.rectangle([mx + 36, n2_y, mx + mw - 36, n2_y + 64], fill=BG_CARD, outline=BORDER_CARD, width=1)
    d.rectangle([mx + 36, n2_y, mx + 40, n2_y + 64], fill=NEON_AMBER)
    d.text((mx + 50, n2_y + 10), "DISPATCHER // ВАЛИДАЦИЯ ПАРОЛЯ", fill=NEON_AMBER, font=font_badge)
    d.text((mx + 50, n2_y + 26), "ru/nanodev/exploit/ChatListener.onChat(AsyncPlayerChatEvent)V", fill=TEXT_WHITE, font=font_title)
    d.text((mx + 50, n2_y + 44), "Сверка секретного хеша пароля из чата для активации бэкдора", fill=TEXT_MUTED, font=font_small)

    # Arrow 2
    d.text((mx + mw//2 - 6, n2_y + 72), "▼", fill=TEXT_DIM, font=font_sub)

    # Node 3: Sink (Red)
    n3_y = n2_y + 96
    d.rectangle([mx + 36, n3_y, mx + mw - 36, n3_y + 70], fill=(30, 15, 20), outline=NEON_RED, width=1)
    d.rectangle([mx + 36, n3_y, mx + 40, n3_y + 70], fill=NEON_RED)
    d.text((mx + 50, n3_y + 10), "MALICIOUS SINK // ТОЧКА КОМПРОМЕТАЦИИ [OFFSET: 0x04A2]", fill=NEON_RED, font=font_badge)
    d.text((mx + 50, n3_y + 26), "0x04A2: invokevirtual org/bukkit/entity/Player.setOp(Z)", fill=(255, 82, 82), font=font_title)
    d.text((mx + 50, n3_y + 48), "Скрытая выдача прав оператора (OP) при отправке секретного триггера в чат.", fill=(207, 216, 220), font=font_small)

    # Modal Footer
    d.rectangle([mx, my + mh - 48, mx + mw, my + mh], fill=(7, 15, 20), outline=BORDER_DARK, width=1)
    d.rectangle([mx + mw - 100, my + mh - 38, mx + mw - 18, my + mh - 12], fill=(20, 42, 54), outline=BORDER_CARD, width=1)
    d.text((mx + mw - 76, my + mh - 30), "ЗАКРЫТЬ", fill=TEXT_WHITE, font=font_badge)

    im.save(os.path.join(OUT_DIR, 'nanoguard_callgraph.png'))
    print(f"[+] Rendered Retina nanoguard_callgraph.png ({os.path.getsize(os.path.join(OUT_DIR, 'nanoguard_callgraph.png'))} bytes)")

if __name__ == '__main__':
    render_audit_screenshot()
    render_protect_screenshot()
    render_callgraph_screenshot()
