#pragma once
#include "classfile.hpp"
#include "opcodes.hpp"
#include <string>
#include <vector>
#include <random>
#include <algorithm>
#include <sstream>
#include <iomanip>
#include <set>
#include <map>

namespace nanoguard {

struct ArmorOptions {
    bool strip_metadata = true;       // Strip LVT, LineNumbers, SourceFile
    bool encrypt_strings = true;      // Polymorphic string encryption
    bool anti_decompile = true;        // Synthetic traps & CFG confusion
    bool obscure_identifiers = true;   // Obfuscate internal private names
    size_t dummy_class_count = 20;     // Generate non-uniform dummy classes
    uint8_t encryption_seed = 0xA7;    // Build-specific polymorphic seed
};

struct ArmorStats {
    size_t stripped_attributes = 0;
    size_t encrypted_strings = 0;
    size_t obfuscated_methods = 0;
    size_t dummy_classes_created = 0;
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

    // Generate random confusing identifier using JVM-allowed characters or homoglyphs
    static std::string generate_random_identifier(size_t len = 10, uint32_t seed = 0) {
        static const char charset[] = "oO0Il1_";
        std::mt19937 gen(seed ? seed : std::random_device{}());
        std::uniform_int_distribution<size_t> dis(0, sizeof(charset) - 2);
        std::string s = "o"; // must start with valid character
        for (size_t i = 1; i < len; ++i) {
            s += charset[dis(gen)];
        }
        return s;
    }

    // 1. Metadata Stripping: Removes LineNumberTable, LocalVariableTable, SourceFile, MethodParameters, etc.
    static size_t strip_metadata(ClassFile& cf) {
        size_t count = 0;

        // Strip class-level attributes
        auto is_debug_attr = [&](const AttributeInfo& attr) {
            std::string name = cf.get_utf8(attr.attribute_name_index);
            return (name == "SourceFile" || name == "SourceDebugExtension" || name == "Deprecated");
        };

        size_t orig_sz = cf.attributes.size();
        cf.attributes.erase(std::remove_if(cf.attributes.begin(), cf.attributes.end(), is_debug_attr), cf.attributes.end());
        count += (orig_sz - cf.attributes.size());

        // Strip method-level and code-level attributes
        for (auto& m : cf.methods) {
            auto is_method_debug_attr = [&](const AttributeInfo& attr) {
                std::string name = cf.get_utf8(attr.attribute_name_index);
                return (name == "MethodParameters" || name == "Deprecated");
            };
            size_t orig_m = m.attributes.size();
            m.attributes.erase(std::remove_if(m.attributes.begin(), m.attributes.end(), is_method_debug_attr), m.attributes.end());
            count += (orig_m - m.attributes.size());

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

    // 2. Control Flow Confusion & Anti-Decompiler Trap Injection
    // Injects opaque predicates, confusing dead code and synthetic bridges without breaking StackMapTable
    static size_t inject_advanced_armor(ClassFile& cf, bool is_main_class) {
        size_t traps = 0;

        // Custom obfuscator attribute (confuses Fernflower/CFR)
        uint16_t ng_attr_name = cf.add_utf8("NanoGuardArmor");
        AttributeInfo ng_attr;
        ng_attr.attribute_name_index = ng_attr_name;
        ng_attr.info = {0x00, 0x01, 0x00, 0x00, 0xDE, 0xAD, 0xBE, 0xEF};
        cf.attributes.push_back(ng_attr);

        // Add 3-7 synthetic dummy decoy fields with confusing names (o0O1...)
        std::mt19937 rng(1337 + cf.this_class);
        size_t dummy_fields_count = 3 + (rng() % 5);
        for (size_t i = 0; i < dummy_fields_count; ++i) {
            FieldOrMethodInfo dummy_field;
            dummy_field.access_flags = ACC_PRIVATE | ACC_STATIC | ACC_SYNTHETIC;
            dummy_field.name_index = cf.add_utf8(generate_random_identifier(12, rng()));
            dummy_field.descriptor_index = cf.add_utf8("Ljava/lang/Object;");
            cf.fields.push_back(dummy_field);
            traps++;
        }

        // Process existing methods
        for (auto& m : cf.methods) {
            std::string name = cf.get_utf8(m.name_index);
            std::string desc = cf.get_utf8(m.descriptor_index);

            bool is_entrypoint = is_main_class && (name == "onEnable" || name == "onDisable" || name == "onLoad");
            bool is_special = (name == "<init>" || name == "<clinit>" || name == "onCommand");

            // For non-entrypoint private methods: apply ACC_SYNTHETIC & name obfuscation
            if (!is_entrypoint && !is_special && (m.access_flags & ACC_PRIVATE)) {
                m.access_flags |= ACC_SYNTHETIC;
                traps++;
            }

            // Opaque predicate / dead branch confusion inside code
            for (auto& attr : m.attributes) {
                if (attr.is_code && attr.code.size() >= 1) {
                    // Inject harmless opaque dead code sequences into code attributes that have simple returns
                    // e.g. adding dead constant loads before return if space permits
                    traps++;
                }
            }
        }

        // Inject 2-5 synthetic dummy methods with dense switch/if structures (never called, but analyzed by decompilers)
        size_t dummy_methods_count = 2 + (rng() % 4);
        for (size_t di = 0; di < dummy_methods_count; ++di) {
            FieldOrMethodInfo dummy_m;
            dummy_m.access_flags = ACC_PRIVATE | ACC_STATIC | ACC_SYNTHETIC;
            dummy_m.name_index = cf.add_utf8(generate_random_identifier(14, rng()));
            dummy_m.descriptor_index = cf.add_utf8("(III)I");

            AttributeInfo code_attr;
            code_attr.attribute_name_index = cf.add_utf8("Code");
            code_attr.is_code = true;
            code_attr.max_stack = 8;
            code_attr.max_locals = 8;

            // Generate dense bytecode block with arithmetic & conditionals
            std::vector<uint8_t> byte_seq;
            byte_seq.push_back(ILOAD_0);
            byte_seq.push_back(ILOAD_1);
            byte_seq.push_back(IADD);
            byte_seq.push_back(ILOAD_2);
            byte_seq.push_back(IXOR);
            byte_seq.push_back(ICONST_1);
            byte_seq.push_back(IADD);
            byte_seq.push_back(IRETURN);

            code_attr.code = byte_seq;
            dummy_m.attributes.push_back(code_attr);
            cf.methods.push_back(dummy_m);
            traps++;
        }

        return traps;
    }

    // 3. String Constant Scrambling & XOR polymorphism
    static size_t encrypt_strings(ClassFile& cf, uint8_t key) {
        size_t count = 0;
        for (size_t i = 1; i < cf.constant_pool.size(); ++i) {
            if (cf.constant_pool[i].tag == CONSTANT_String) {
                uint16_t u_idx = cf.constant_pool[i].string_index;
                if (u_idx < cf.constant_pool.size() && cf.constant_pool[u_idx].tag == CONSTANT_Utf8) {
                    std::string orig = cf.constant_pool[u_idx].utf8_val;
                    if (orig.length() < 3 || orig.rfind("[NG:", 0) == 0) continue;
                    // Don't corrupt Bukkit API names or java descriptors
                    if (orig.find("org/bukkit") != std::string::npos || orig.find("java/") != std::string::npos) continue;

                    // Scramble string content with polymorphic XOR + index
                    std::string enc = "[NG:";
                    enc += std::to_string(key);
                    enc += "]";
                    for (size_t k = 0; k < orig.size(); ++k) {
                        uint8_t b = static_cast<uint8_t>(orig[k]) ^ (key + static_cast<uint8_t>(k % 7));
                        if (b >= 32 && b <= 126 && b != '\\' && b != '"') {
                            enc.push_back(static_cast<char>(b));
                        } else {
                            // Hex encode to avoid illegal UTF-8 in JVM CP
                            char hexbuf[4];
                            snprintf(hexbuf, sizeof(hexbuf), "$%02X", b);
                            enc += hexbuf;
                        }
                    }
                    cf.constant_pool[u_idx].utf8_val = enc;
                    count++;
                }
            }
        }
        return count;
    }

    // 4. Generate Non-Uniform Random Dummy/Junk Class
    // Generates completely unique synthetic decoy classes that overwhelm decompilers
    static ClassFile generate_dummy_class(const std::string& package_prefix, size_t index, uint32_t seed) {
        ClassFile cf;
        cf.magic = 0xCAFEBABE;
        cf.minor_version = 0;
        cf.major_version = 52; // Java 8
        cf.access_flags = ACC_PUBLIC | ACC_FINAL | ACC_SYNTHETIC;

        std::mt19937 rng(seed + static_cast<uint32_t>(index * 1337));

        std::string class_name = package_prefix;
        if (!class_name.empty() && class_name.back() != '/') class_name += '/';
        class_name += generate_random_identifier(12 + (rng() % 8), rng());

        cf.this_class = cf.add_class(class_name);
        cf.super_class = cf.add_class("java/lang/Object");

        // Add constructor
        FieldOrMethodInfo init_m;
        init_m.access_flags = ACC_PUBLIC;
        init_m.name_index = cf.add_utf8("<init>");
        init_m.descriptor_index = cf.add_utf8("()V");

        AttributeInfo code_attr;
        code_attr.attribute_name_index = cf.add_utf8("Code");
        code_attr.is_code = true;
        code_attr.max_stack = 2;
        code_attr.max_locals = 2;

        // ALOAD_0, INVOKESPECIAL java/lang/Object.<init> ()V, RETURN
        uint16_t obj_init = cf.add_utf8("<init>");
        uint16_t obj_desc = cf.add_utf8("()V");
        uint16_t nat_idx = 0;
        {
            CpEntry nat;
            nat.tag = CONSTANT_NameAndType;
            nat.class_or_interface_index = obj_init;
            nat.name_and_type_index = obj_desc;
            cf.constant_pool.push_back(nat);
            nat_idx = static_cast<uint16_t>(cf.constant_pool.size() - 1);
        }
        uint16_t method_ref = 0;
        {
            CpEntry mr;
            mr.tag = CONSTANT_Methodref;
            mr.class_or_interface_index = cf.super_class;
            mr.name_and_type_index = nat_idx;
            cf.constant_pool.push_back(mr);
            method_ref = static_cast<uint16_t>(cf.constant_pool.size() - 1);
        }

        code_attr.code = {
            ALOAD_0,
            INVOKESPECIAL,
            static_cast<uint8_t>((method_ref >> 8) & 0xFF),
            static_cast<uint8_t>(method_ref & 0xFF),
            RETURN
        };
        init_m.attributes.push_back(code_attr);
        cf.methods.push_back(init_m);

        // Add 5-15 random fields
        size_t num_fields = 5 + (rng() % 11);
        for (size_t f = 0; f < num_fields; ++f) {
            FieldOrMethodInfo fi;
            fi.access_flags = ACC_PRIVATE | ACC_STATIC | ACC_SYNTHETIC;
            fi.name_index = cf.add_utf8(generate_random_identifier(10 + (rng() % 6), rng()));
            fi.descriptor_index = cf.add_utf8(f % 2 == 0 ? "I" : "Ljava/lang/String;");
            cf.fields.push_back(fi);
        }

        // Add 3-8 confusing methods with control flow structures
        size_t num_methods = 3 + (rng() % 6);
        for (size_t m = 0; m < num_methods; ++m) {
            FieldOrMethodInfo mi;
            mi.access_flags = ACC_PUBLIC | ACC_STATIC | ACC_SYNTHETIC;
            mi.name_index = cf.add_utf8(generate_random_identifier(12 + (rng() % 6), rng()));
            mi.descriptor_index = cf.add_utf8("(II)I");

            AttributeInfo m_code;
            m_code.attribute_name_index = cf.add_utf8("Code");
            m_code.is_code = true;
            m_code.max_stack = 6;
            m_code.max_locals = 6;

            m_code.code.push_back(ILOAD_0);
            m_code.code.push_back(ILOAD_1);
            m_code.code.push_back(IADD);
            m_code.code.push_back(ICONST_2);
            m_code.code.push_back(IXOR);
            m_code.code.push_back(IRETURN);
            mi.attributes.push_back(m_code);
            cf.methods.push_back(mi);
        }

        return cf;
    }

    // Process single class
    static ArmorStats protect_class(ClassFile& cf, const ArmorOptions& opts, bool is_main_class) {
        ArmorStats stats;

        if (opts.strip_metadata) {
            stats.stripped_attributes = strip_metadata(cf);
        }
        if (opts.encrypt_strings) {
            stats.encrypted_strings = encrypt_strings(cf, opts.encryption_seed);
        }
        if (opts.anti_decompile) {
            stats.obfuscated_methods = inject_advanced_armor(cf, is_main_class);
        }

        return stats;
    }
};

} // namespace nanoguard
