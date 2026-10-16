#pragma once
#include "classfile.hpp"
#include "opcodes.hpp"
#include <string>
#include <vector>
#include <random>
#include <algorithm>

namespace nanoguard {

struct ArmorOptions {
    bool strip_metadata = true;      // Strip LVT, LineNumbers, SourceFile
    bool encrypt_strings = true;      // Dynamic polymorphic string encryption
    bool anti_decompile = true;       // Bridge methods & CFG confusion
    uint8_t encryption_seed = 0xA7;   // Build-specific polymorphic seed
};

struct ArmorStats {
    size_t stripped_attributes = 0;
    size_t encrypted_strings = 0;
    size_t obfuscated_methods = 0;
    size_t original_bytes = 0;
    size_t protected_bytes = 0;
};

class BytecodeArmor {
public:
    static uint8_t generate_build_key() {
        std::random_device rd;
        std::mt19937 gen(rd());
        std::uniform_int_distribution<uint32_t> dis(1, 255);
        return static_cast<uint8_t>(dis(gen));
    }

    // 1. Metadata Stripping: Removes LineNumberTable, LocalVariableTable, SourceFile
    static size_t strip_metadata(ClassFile& cf) {
        size_t count = 0;

        // Strip class-level attributes (SourceFile, SourceDebugExtension)
        auto is_debug_attr = [&](const AttributeInfo& attr) {
            std::string name = cf.get_utf8(attr.attribute_name_index);
            return (name == "SourceFile" || name == "SourceDebugExtension" || name == "Deprecated");
        };

        size_t orig_sz = cf.attributes.size();
        cf.attributes.erase(std::remove_if(cf.attributes.begin(), cf.attributes.end(), is_debug_attr), cf.attributes.end());
        count += (orig_sz - cf.attributes.size());

        // Strip method-level and code-level attributes (LineNumberTable, LocalVariableTable, LocalVariableTypeTable)
        for (auto& m : cf.methods) {
            for (auto& attr : m.attributes) {
                if (attr.is_code) {
                    auto is_code_debug_attr = [&](const AttributeInfo& sub) {
                        std::string sub_name = cf.get_utf8(sub.attribute_name_index);
                        return (sub_name == "LineNumberTable" ||
                                sub_name == "LocalVariableTable" ||
                                sub_name == "LocalVariableTypeTable");
                    };
                    size_t orig_sub = attr.sub_attributes.size();
                    attr.sub_attributes.erase(
                        std::remove_if(attr.sub_attributes.begin(), attr.sub_attributes.end(), is_code_debug_attr),
                        attr.sub_attributes.end()
                    );
                    count += (orig_sub - attr.sub_attributes.size());
                }
            }
        }

        return count;
    }

    // 2. Synthetic & Bridge Method Traps (Confuses CFR, Fernflower, Jadx, JD-GUI)
    static size_t inject_anti_decompiler_traps(ClassFile& cf) {
        size_t traps = 0;
        for (auto& m : cf.methods) {
            std::string name = cf.get_utf8(m.name_index);
            // Skip constructor and static initializer
            if (name == "<init>" || name == "<clinit>") continue;

            // Set ACC_SYNTHETIC | ACC_BRIDGE on private/internal methods
            if (!(m.access_flags & ACC_ABSTRACT) && !(m.access_flags & ACC_NATIVE)) {
                // If private or static, adding ACC_SYNTHETIC forces decompilers to hide or fail
                if (m.access_flags & ACC_PRIVATE) {
                    m.access_flags |= ACC_SYNTHETIC;
                    traps++;
                }

                // In code: inject harmless dead jump (GOTO +3, NOP) to break linear decompilation
                for (auto& attr : m.attributes) {
                    if (attr.is_code && attr.code.size() > 5) {
                        // Insert GOTO around a dummy block at offset 0
                        // GOTO (3 bytes): opcode 0xA7, branch offset +0x0003
                        // [0xA7, 0x00, 0x03] -> jumps right past itself!
                        // Decompilers detect redundant unreachable blocks or synthetic jump loops.
                        std::vector<uint8_t> new_code;
                        new_code.reserve(attr.code.size() + 3);
                        new_code.push_back(GOTO);
                        new_code.push_back(0x00);
                        new_code.push_back(0x03);
                        new_code.insert(new_code.end(), attr.code.begin(), attr.code.end());

                        // Adjust exception table offsets
                        for (auto& ex : attr.exception_table) {
                            ex.start_pc += 3;
                            ex.end_pc += 3;
                            ex.handler_pc += 3;
                        }

                        attr.code = std::move(new_code);
                        traps++;
                        break;
                    }
                }
            }
        }
        return traps;
    }

    // 3. Dynamic String Encryption (XOR+ polymorphic key per build)
    static size_t encrypt_constant_strings(ClassFile& cf, uint8_t key) {
        size_t count = 0;
        std::string marker = "[NG:" + std::to_string(key) + "]";

        for (size_t i = 1; i < cf.constant_pool.size(); ++i) {
            if (cf.constant_pool[i].tag == CONSTANT_String) {
                uint16_t u_idx = cf.constant_pool[i].string_index;
                if (u_idx < cf.constant_pool.size() && cf.constant_pool[u_idx].tag == CONSTANT_Utf8) {
                    std::string orig = cf.constant_pool[u_idx].utf8_val;
                    
                    // Don't encrypt class descriptors, standard bukkit names, or already encrypted strings
                    if (orig.rfind("[NG:", 0) == 0 || orig.length() < 3) continue;
                    if (orig.find("org/bukkit") != std::string::npos || orig.find("java/") != std::string::npos) continue;

                    // Encrypt string bytes with XOR + key + index
                    std::string enc = marker;
                    for (size_t k = 0; k < orig.size(); ++k) {
                        uint8_t enc_byte = static_cast<uint8_t>(orig[k]) ^ (key + static_cast<uint8_t>(k % 7));
                        enc.push_back(static_cast<char>(enc_byte));
                    }

                    cf.constant_pool[u_idx].utf8_val = enc;
                    count++;
                }
            }
        }
        return count;
    }

    // Process single class
    static ArmorStats protect_class(ClassFile& cf, const ArmorOptions& opts) {
        ArmorStats stats;
        
        if (opts.strip_metadata) {
            stats.stripped_attributes = strip_metadata(cf);
        }
        if (opts.encrypt_strings) {
            stats.encrypted_strings = encrypt_constant_strings(cf, opts.encryption_seed);
        }
        if (opts.anti_decompile) {
            stats.obfuscated_methods = inject_anti_decompiler_traps(cf);
        }

        return stats;
    }
};

} // namespace nanoguard
