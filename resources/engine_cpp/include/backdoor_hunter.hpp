#pragma once
#include "classfile.hpp"
#include "cfg.hpp"
#include <string>
#include <vector>
#include <sstream>
#include <iomanip>
#include <algorithm>

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
        // Obfuscation fingerprinting
        for (size_t i = 1; i < cf.constant_pool.size(); ++i) {
            if (cf.constant_pool[i].tag == CONSTANT_Utf8) {
                const auto& s = cf.constant_pool[i].utf8_val;
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

        // 1. Scan constant pool strings for obvious indicators & Discord Webhooks / C2
        for (size_t i = 1; i < cf.constant_pool.size(); ++i) {
            if (cf.constant_pool[i].tag == CONSTANT_Utf8) {
                std::string s = cf.constant_pool[i].utf8_val;
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
                    f.description = "Обнаружена ссылка на сырой удалённый пейлоад (Pastebin/Transfer).";
                    f.snippet = "URL: " + s;
                    findings.push_back(f);
                }
            }
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
                        if (target.find("setOp") != std::string::npos && target.find("(Z)V") != std::string::npos) {
                            HunterFinding f;
                            f.category = "ForceOP / Backdoor Hijack";
                            f.severity = "CRITICAL";
                            f.class_name = class_name;
                            f.method_name = m_name + m_desc;
                            f.offset = inst.offset;
                            f.instruction_hex = inst.to_string();
                            f.instruction_str = opcode_to_string(inst.opcode) + (" " + target);
                            f.description = "Прямой вызов выдачи операторских прав Player.setOp(true).";

                            // Context snippet
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
                            // Check if preceding instructions load "*"
                            bool loads_star = false;
                            size_t lookback = (idx > 4) ? idx - 4 : 0;
                            for (size_t k = lookback; k < idx; ++k) {
                                if (cfg.instructions[k].disassembly.find("\"*\"") != std::string::npos) {
                                    loads_star = true;
                                    break;
                                }
                            }
                            if (loads_star) {
                                HunterFinding f;
                                f.category = "Permission Hijack (* Grants)";
                                f.severity = "CRITICAL";
                                f.class_name = class_name;
                                f.method_name = m_name + m_desc;
                                f.offset = inst.offset;
                                f.instruction_hex = inst.to_string();
                                f.instruction_str = opcode_to_string(inst.opcode) + (" " + target);
                                f.description = "Скрытая выдача прав звездочки '*' через PermissionAttachment.";
                                findings.push_back(f);
                            }
                        }

                        // 2.3 RCE: ProcessBuilder & Runtime.getRuntime().exec()
                        if (target.find("java/lang/Runtime.exec") != std::string::npos ||
                            target.find("java/lang/ProcessBuilder.start") != std::string::npos) {
                            HunterFinding f;
                            f.category = "RCE / Process Execution";
                            f.severity = "HIGH";
                            f.class_name = class_name;
                            f.method_name = m_name + m_desc;
                            f.offset = inst.offset;
                            f.instruction_hex = inst.to_string();
                            f.instruction_str = opcode_to_string(inst.opcode) + (" " + target);
                            f.description = "Вызов системных команд через ProcessBuilder или Runtime.getRuntime().exec().";

                            std::ostringstream snip;
                            size_t start_ctx = (idx > 2) ? idx - 2 : 0;
                            size_t end_ctx = std::min(idx + 2, cfg.instructions.size() - 1);
                            for (size_t c = start_ctx; c <= end_ctx; ++c) {
                                snip << (c == idx ? ">>> " : "    ") << cfg.instructions[c].to_string() << "\n";
                            }
                            f.snippet = snip.str();
                            findings.push_back(f);
                        }

                        // 2.4 URLClassLoader / Dynamic Dex/Jar Dropper
                        if (target.find("java/net/URLClassLoader.<init>") != std::string::npos ||
                            target.find("loadClass") != std::string::npos && target.find("ClassLoader") != std::string::npos) {
                            HunterFinding f;
                            f.category = "Dynamic ClassLoader / Dropper";
                            f.severity = "CRITICAL";
                            f.class_name = class_name;
                            f.method_name = m_name + m_desc;
                            f.offset = inst.offset;
                            f.instruction_hex = inst.to_string();
                            f.instruction_str = opcode_to_string(inst.opcode) + (" " + target);
                            f.description = "Динамическая подгрузка внешнего байткода через URLClassLoader.";
                            findings.push_back(f);
                        }

                        // 2.5 Reflection Abuse: Method.invoke or Field.setAccessible
                        if (target.find("java/lang/reflect/Method.invoke") != std::string::npos ||
                            target.find("setAccessible") != std::string::npos) {
                            HunterFinding f;
                            f.category = "Reflection Abuse / Evasion";
                            f.severity = "MEDIUM";
                            f.class_name = class_name;
                            f.method_name = m_name + m_desc;
                            f.offset = inst.offset;
                            f.instruction_hex = inst.to_string();
                            f.instruction_str = opcode_to_string(inst.opcode) + (" " + target);
                            f.description = "Использование Java Reflection для обхода проверок безопасности.";
                            findings.push_back(f);
                        }
                    }

                    // 2.6 Chat backdoor heuristics
                    if (is_chat_event_handler && (inst.opcode == IF_ACMPEQ || inst.opcode == IF_ACMPNE ||
                        inst.opcode == INVOKEVIRTUAL && inst.disassembly.find("equals") != std::string::npos)) {
                        
                        // Check if comparing message with secret string
                        size_t lookback = (idx > 3) ? idx - 3 : 0;
                        for (size_t k = lookback; k < idx; ++k) {
                            if (cfg.instructions[k].opcode == LDC || cfg.instructions[k].opcode == LDC_W) {
                                std::string literal = cfg.instructions[k].disassembly;
                                if (!literal.empty() && literal.length() > 4 && literal[0] == '"') {
                                    HunterFinding f;
                                    f.category = "Hidden Chat Command / Password Trigger";
                                    f.severity = "HIGH";
                                    f.class_name = class_name;
                                    f.method_name = m_name + m_desc;
                                    f.offset = inst.offset;
                                    f.instruction_hex = inst.to_string();
                                    f.instruction_str = "String comparison: " + literal;
                                    f.description = "Сравнение текста чата со скрытой ключевой строкой (бэкдор-пароль).";
                                    f.snippet = "Secret token check: " + literal;
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
