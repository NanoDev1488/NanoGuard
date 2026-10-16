#pragma once
#include "classfile.hpp"
#include "cfg.hpp"
#include <string>
#include <vector>
#include <sstream>
#include <iomanip>
#include <algorithm>
#include <regex>

namespace nanoguard {

struct HunterFinding {
    std::string category;
    std::string severity; // CRITICAL, HIGH, MEDIUM, LOW
    std::string class_name;
    std::string method_name;
    size_t offset = 0;
    std::string instruction_hex;
    std::string instruction_str;
    std::string snippet;
    std::string description;
};

class BackdoorHunter {
public:
    static std::string xor_decrypt(const std::string& input, uint8_t key) {
        std::string res = input;
        for (char& c : res) {
            c ^= key;
        }
        return res;
    }

    static bool is_listener_class(const ClassFile& cf) {
        for (uint16_t iface : cf.interfaces) {
            std::string name = cf.get_class_name(iface);
            if (name == "org/bukkit/event/Listener") return true;
        }
        return false;
    }

    static std::string detect_obfuscator(const ClassFile& cf) {
        for (size_t i = 1; i < cf.constant_pool.size(); ++i) {
            if (cf.constant_pool[i].tag == CONSTANT_Utf8) {
                const auto& s = cf.constant_pool[i].utf8_val;
                if (s.find("NanoGuard") != std::string::npos || s.find("NANOGUARD") != std::string::npos) {
                    return "NanoGuard Bytecode Armor";
                }
                if (s.find("ALLATORIdemo") != std::string::npos || s.find("allatori") != std::string::npos) {
                    return "Allatori Obfuscator";
                }
                if (s.find("ZKM") != std::string::npos || s.find("Zelix") != std::string::npos) {
                    return "Zelix KlassMaster (ZKM)";
                }
                if (s.find("Stringer") != std::string::npos) {
                    return "Stringer";
                }
                if (s.find("ProGuard") != std::string::npos) {
                    return "ProGuard";
                }
            }
        }
        return "None / Standard Javac";
    }

    static std::vector<HunterFinding> scan_class(const ClassFile& cf) {
        std::vector<HunterFinding> findings;
        std::string class_name = cf.get_class_name(cf.this_class);
        bool is_listener = is_listener_class(cf);

        bool has_asm = false;
        bool has_plugins = false;
        bool has_classloader = false;
        bool has_define_class = false;

        // 1. Scan constant pool strings for all threat vectors
        for (size_t i = 1; i < cf.constant_pool.size(); ++i) {
            if (cf.constant_pool[i].tag == CONSTANT_Utf8) {
                std::string s = cf.constant_pool[i].utf8_val;

                if (s.find("org/objectweb/asm") != std::string::npos || s.find("org.objectweb.asm") != std::string::npos) {
                    has_asm = true;
                }
                if (s.find("getPlugins") != std::string::npos) {
                    has_plugins = true;
                }
                if (s.find("getClassLoader") != std::string::npos || s.find("URLClassLoader") != std::string::npos) {
                    has_classloader = true;
                }
                if (s.find("defineClass") != std::string::npos) {
                    has_define_class = true;
                }

                // 1.1 Known IOCs: RofuYT
                if (s == "RofuYT" || s.find("RofuYT") != std::string::npos) {
                    HunterFinding f;
                    f.category = "Specific Backdoor IOC (RofuYT)";
                    f.severity = "CRITICAL";
                    f.class_name = class_name;
                    f.method_name = "<constant_pool>";
                    f.offset = i;
                    f.instruction_str = "CONSTANT_Utf8: " + s;
                    f.description = "Жёстко зашитый никнейм автора бэкдора 'RofuYT' (образец малвари bStats, выдающий ForceOP).";
                    f.snippet = "IOC: " + s;
                    findings.push_back(f);
                }

                // 1.2 Fractureiser IOCs
                if (s.find("plugin-config.bin") != std::string::npos ||
                    s.find("files-8ie.pages.dev") != std::string::npos ||
                    s.find("85.217.144.130") != std::string::npos ||
                    s.find("systemd-utility.service") != std::string::npos) {
                    HunterFinding f;
                    f.category = "Fractureiser Malware IOC";
                    f.severity = "CRITICAL";
                    f.class_name = class_name;
                    f.method_name = "<constant_pool>";
                    f.offset = i;
                    f.instruction_str = "CONSTANT_Utf8: " + s;
                    f.description = "Обнаружен точный IOC известного вируса Fractureiser (C2 адрес или дроппер-артефакт).";
                    f.snippet = "IOC: " + s;
                    findings.push_back(f);
                }

                // 1.3 Discord Webhook URL
                if (s.find("discord.com/api/webhooks") != std::string::npos ||
                    s.find("discordapp.com/api/webhooks") != std::string::npos) {
                    HunterFinding f;
                    f.category = "Data Exfiltration (Discord Webhook)";
                    f.severity = "HIGH";
                    f.class_name = class_name;
                    f.method_name = "<constant_pool>";
                    f.offset = i;
                    f.instruction_str = "CONSTANT_Utf8: " + s;
                    f.description = "Обнаружен Discord Webhook URL для скрытой кражи данных или логов сервера.";
                    f.snippet = "URL: " + s;
                    findings.push_back(f);
                }

                // 1.4 Telegram Bot API
                if (s.find("api.telegram.org/bot") != std::string::npos) {
                    HunterFinding f;
                    f.category = "Data Exfiltration (Telegram Bot)";
                    f.severity = "HIGH";
                    f.class_name = class_name;
                    f.method_name = "<constant_pool>";
                    f.offset = i;
                    f.instruction_str = "CONSTANT_Utf8: " + s;
                    f.description = "Обнаружено обращение к Telegram Bot API для скрытой отправки данных наружу.";
                    f.snippet = "URL: " + s;
                    findings.push_back(f);
                }

                // 1.5 Browser & Discord InfoStealer Paths
                if ((s.find("Local Storage") != std::string::npos && s.find("leveldb") != std::string::npos) ||
                    (s.find("User Data") != std::string::npos && (s.find("Login Data") != std::string::npos || s.find("Cookies") != std::string::npos))) {
                    HunterFinding f;
                    f.category = "Credential Theft (Browser Stealer)";
                    f.severity = "HIGH";
                    f.class_name = class_name;
                    f.method_name = "<constant_pool>";
                    f.offset = i;
                    f.instruction_str = "CONSTANT_Utf8: " + s;
                    f.description = "Попытка доступа к путям паролей/куки браузеров (Login Data / Cookies / leveldb).";
                    f.snippet = "Path: " + s;
                    findings.push_back(f);
                }

                // 1.6 Persistence
                if (s.find("schtasks /create") != std::string::npos ||
                    (s.find("Start Menu") != std::string::npos && s.find("Startup") != std::string::npos)) {
                    HunterFinding f;
                    f.category = "System Persistence";
                    f.severity = "HIGH";
                    f.class_name = class_name;
                    f.method_name = "<constant_pool>";
                    f.offset = i;
                    f.instruction_str = "CONSTANT_Utf8: " + s;
                    f.description = "Механизм закрепления в системе (планировщик задач или папка автозагрузки Windows).";
                    f.snippet = "Persistence: " + s;
                    findings.push_back(f);
                }

                // 1.7 Remote droppers (Pastebin / Transfer)
                if (s.find("pastebin.com/raw") != std::string::npos ||
                    s.find("hastebin.com/raw") != std::string::npos ||
                    s.find("transfer.sh") != std::string::npos) {
                    HunterFinding f;
                    f.category = "C2 / Remote Payload Dropper";
                    f.severity = "CRITICAL";
                    f.class_name = class_name;
                    f.method_name = "<constant_pool>";
                    f.offset = i;
                    f.instruction_str = "CONSTANT_Utf8: " + s;
                    f.description = "Обнаружена ссылка на сырой удалённый исполняемый пейлоад (Pastebin/Transfer).";
                    f.snippet = "URL: " + s;
                    findings.push_back(f);
                }
            }
        }

        // 1.8 Bytecode Patching Attack Pattern (ASM + getPlugins + getClassLoader + defineClass)
        if (has_asm && has_plugins && has_classloader && has_define_class) {
            HunterFinding f;
            f.category = "Runtime Bytecode Injection / Backdoor Patching";
            f.severity = "CRITICAL";
            f.class_name = class_name;
            f.method_name = "<class>";
            f.offset = 0;
            f.instruction_str = "ASM + getPlugins + getClassLoader + defineClass";
            f.description = "Комбинация сигналов: внедрение библиотеки ASM, перечисление всех плагинов сервера, чтение их классов и инъекция модифицированного байткода через defineClass в рантайме.";
            f.snippet = "Class uses ASM to dynamically patch other plugins at runtime";
            findings.push_back(f);
        }

        // 2. Scan methods and bytecode instructions
        for (const auto& m : cf.methods) {
            std::string m_name = cf.get_utf8(m.name_index);
            std::string m_desc = cf.get_utf8(m.descriptor_index);

            bool is_chat_event_handler = is_listener && (
                m_desc.find("AsyncPlayerChatEvent") != std::string::npos ||
                m_desc.find("PlayerCommandPreprocessEvent") != std::string::npos
            );

            for (const auto& attr : m.attributes) {
                if (!attr.is_code) continue;

                ControlFlowGraph cfg = ControlFlowGraph::build(cf, attr.code);

                for (size_t idx = 0; idx < cfg.instructions.size(); ++idx) {
                    const auto& inst = cfg.instructions[idx];

                    // Check method invocations
                    if (inst.opcode == INVOKEVIRTUAL || inst.opcode == INVOKESTATIC ||
                        inst.opcode == INVOKESPECIAL || inst.opcode == INVOKEINTERFACE) {
                        
                        std::string target = inst.disassembly;

                        // 2.1 Player.setOp(Z)
                        if (target.find("setOp") != std::string::npos && (target.find("(Z)V") != std::string::npos || target.find("setOp") != std::string::npos)) {
                            HunterFinding f;
                            f.category = "ForceOP / Backdoor Hijack";
                            f.severity = "CRITICAL";
                            f.class_name = class_name;
                            f.method_name = m_name + m_desc;
                            f.offset = inst.offset;
                            f.instruction_hex = inst.to_string();
                            f.instruction_str = opcode_to_string(inst.opcode) + (" " + target);
                            f.description = "Прямой вызов выдачи операторских прав Player.setOp(true).";

                            std::ostringstream snip;
                            size_t start_ctx = (idx > 3) ? idx - 3 : 0;
                            size_t end_ctx = std::min(idx + 3, cfg.instructions.size() - 1);
                            for (size_t c = start_ctx; c <= end_ctx; ++c) {
                                snip << (c == idx ? ">>> " : "    ") << cfg.instructions[c].to_string() << "\n";
                            }
                            f.snippet = snip.str();
                            findings.push_back(f);
                        }

                        // 2.2 Permissions hijack (* / ALL)
                        if (target.find("addAttachment") != std::string::npos || target.find("setPermission") != std::string::npos) {
                            if (idx > 0) {
                                const auto& prev = cfg.instructions[idx - 1];
                                if (prev.disassembly.find("\"*\"") != std::string::npos || prev.disassembly.find("\"bukkit.command") != std::string::npos) {
                                    HunterFinding f;
                                    f.category = "Permission Hijack (*)";
                                    f.severity = "CRITICAL";
                                    f.class_name = class_name;
                                    f.method_name = m_name + m_desc;
                                    f.offset = inst.offset;
                                    f.instruction_hex = inst.to_string();
                                    f.instruction_str = opcode_to_string(inst.opcode) + (" " + target);
                                    f.description = "Скрытая выдача прав '*' (все права сервера) через PermissionAttachment.";
                                    findings.push_back(f);
                                }
                            }
                        }

                        // 2.3 Command dispatch: op <player>
                        if (target.find("dispatchCommand") != std::string::npos) {
                            HunterFinding f;
                            f.category = "Console Command Injection (dispatchCommand)";
                            f.severity = "HIGH";
                            f.class_name = class_name;
                            f.method_name = m_name + m_desc;
                            f.offset = inst.offset;
                            f.instruction_hex = inst.to_string();
                            f.instruction_str = opcode_to_string(inst.opcode) + (" " + target);
                            f.description = "Выполнение команд сервера через dispatchCommand (возможная выдача OP или консольный бэкдор).";
                            findings.push_back(f);
                        }

                        // 2.4 RCE: Runtime.exec / ProcessBuilder
                        if (target.find("java/lang/Runtime.exec") != std::string::npos ||
                            target.find("java/lang/ProcessBuilder.start") != std::string::npos) {
                            HunterFinding f;
                            f.category = "Remote Code Execution (RCE)";
                            f.severity = "CRITICAL";
                            f.class_name = class_name;
                            f.method_name = m_name + m_desc;
                            f.offset = inst.offset;
                            f.instruction_hex = inst.to_string();
                            f.instruction_str = opcode_to_string(inst.opcode) + (" " + target);
                            f.description = "Запуск системных процессов на сервере через Runtime.exec() или ProcessBuilder.";
                            findings.push_back(f);
                        }

                        // 2.5 Reflection abuse
                        if (target.find("java/lang/reflect/Method.invoke") != std::string::npos ||
                            target.find("sun/misc/Unsafe") != std::string::npos) {
                            HunterFinding f;
                            f.category = "Reflection Abuse / Security Bypass";
                            f.severity = "MEDIUM";
                            f.class_name = class_name;
                            f.method_name = m_name + m_desc;
                            f.offset = inst.offset;
                            f.instruction_hex = inst.to_string();
                            f.instruction_str = opcode_to_string(inst.opcode) + (" " + target);
                            f.description = "Использование глубокой рефлексии или Unsafe для вызова защищённых методов.";
                            findings.push_back(f);
                        }
                    }

                    // 2.6 Chat backdoor listener
                    if (is_chat_event_handler) {
                        if (inst.opcode == INVOKEVIRTUAL && inst.disassembly.find("getMessage") != std::string::npos) {
                            for (size_t scan_ahead = idx; scan_ahead < std::min(idx + 15, cfg.instructions.size()); ++scan_ahead) {
                                if (cfg.instructions[scan_ahead].disassembly.find("setOp") != std::string::npos) {
                                    HunterFinding f;
                                    f.category = "Hidden Chat Trigger Backdoor";
                                    f.severity = "CRITICAL";
                                    f.class_name = class_name;
                                    f.method_name = m_name + m_desc;
                                    f.offset = inst.offset;
                                    f.instruction_hex = inst.to_string();
                                    f.instruction_str = "ChatListener -> setOp";
                                    f.description = "Скрытая команда в чате: при получении секретного сообщения выдаются права оператора.";
                                    findings.push_back(f);
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }

        return findings;
    }
};

} // namespace nanoguard
