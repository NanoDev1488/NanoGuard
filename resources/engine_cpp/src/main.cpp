#include "../include/classfile.hpp"
#include "../include/backdoor_hunter.hpp"
#include "../include/bytecode_armor.hpp"
#include "../include/zip_handler.hpp"

#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <chrono>

using namespace nanoguard;

void print_banner() {
    std::cout << R"(
  _   _                      ____                     _ 
 | \ | | __ _ _ __   ___    / ___|_   _  __ _ _ __ __| |
 |  \| |/ _` | '_ \ / _ \  | |  _| | | |/ _` | '__/ _` |
 | |\  | (_| | | | | (_) | | |_| | |_| | (_| | | | (_| |
 |_| \_|\__,_|_| |_|\___/   \____|\__,_|\__,_|_|  \__,_|
   ɴᴀᴛɪᴠᴇ ʙʏᴛᴇᴄᴏᴅᴇ ᴀʀᴍᴏʀ & ʙᴀᴄᴋᴅᴏᴏʀ ʜᴜɴᴛᴇʀ (v0.1.0)
)" << "\n";
}

void print_help() {
    print_banner();
    std::cout << "Usage:\n";
    std::cout << "  nanoguard.exe --audit <plugin.jar> [--out <report.json>]\n";
    std::cout << "  nanoguard.exe --protect <plugin.jar> [--strip-lvt] [--encrypt-strings] [--anti-decompile] [--out <output.jar>]\n";
    std::cout << "  nanoguard.exe --help\n";
    std::cout << "  nanoguard.exe --version\n\n";
    std::cout << "Options:\n";
    std::cout << "  --audit <jar>          Deep static bytecode inspection for backdoors & exploits\n";
    std::cout << "  --protect <jar>        Apply native armor & obfuscation traps to JAR\n";
    std::cout << "  --strip-lvt            Strip LineNumberTable, LocalVariableTable, SourceFile\n";
    std::cout << "  --encrypt-strings      Encrypt string constants with polymorphic XOR keys\n";
    std::cout << "  --anti-decompile       Inject synthetic bridge traps to confuse Fernflower/JADX\n";
    std::cout << "  --out <path>           Output destination file or directory\n";
}

std::string escape_json(const std::string& s) {
    std::string res;
    for (char c : s) {
        if (c == '"') res += "\\\"";
        else if (c == '\\') res += "\\\\";
        else if (c == '\b') res += "\\b";
        else if (c == '\f') res += "\\f";
        else if (c == '\n') res += "\\n";
        else if (c == '\r') res += "\\r";
        else if (c == '\t') res += "\\t";
        else if (static_cast<unsigned char>(c) < 32) {
            // control char
        } else {
            res += c;
        }
    }
    return res;
}

int main(int argc, char* argv[]) {
    if (argc < 2) {
        print_help();
        return 0;
    }

    std::string mode = "";
    std::string input_jar = "";
    std::string output_path = "";
    bool strip_lvt = false;
    bool encrypt_strings = false;
    bool anti_decompile = false;

    for (int i = 1; i < argc; ++i) {
        std::string arg = argv[i];
        if (arg == "--help" || arg == "-h") {
            print_help();
            return 0;
        } else if (arg == "--version" || arg == "-v") {
            std::cout << "NanoGuard v0.1.0 (Native C++17 Core Engine)\n";
            std::cout << "Author: NanoDev (t.me/WineSquad)\n";
            return 0;
        } else if (arg == "--audit" && i + 1 < argc) {
            mode = "audit";
            input_jar = argv[++i];
        } else if (arg == "--protect" && i + 1 < argc) {
            mode = "protect";
            input_jar = argv[++i];
        } else if (arg == "--out" && i + 1 < argc) {
            output_path = argv[++i];
        } else if (arg == "--strip-lvt") {
            strip_lvt = true;
        } else if (arg == "--encrypt-strings") {
            encrypt_strings = true;
        } else if (arg == "--anti-decompile") {
            anti_decompile = true;
        }
    }

    if (mode.empty()) {
        std::cerr << "[!] Error: Specify either --audit or --protect mode.\n";
        return 1;
    }

    // Read input JAR
    std::vector<uint8_t> jar_bytes;
    if (!JarArchive::read_file(input_jar, jar_bytes)) {
        std::cerr << "[!] Error: Failed to open JAR file: " << input_jar << "\n";
        return 1;
    }

    std::vector<JarEntry> entries;
    if (!JarArchive::parse_entries(jar_bytes, entries)) {
        std::cerr << "[!] Error: Failed to parse ZIP structure from: " << input_jar << "\n";
        return 1;
    }

    if (mode == "audit") {
        auto start_t = std::chrono::high_resolution_clock::now();
        std::vector<HunterFinding> all_findings;
        std::string detected_obf = "None / Standard Javac";
        size_t class_count = 0;

        for (const auto& entry : entries) {
            if (!entry.is_class || entry.data.empty()) continue;
            class_count++;

            ClassFile cf;
            if (cf.parse(entry.data.data(), entry.data.size())) {
                std::string obf = BackdoorHunter::detect_obfuscator(cf);
                if (obf != "None / Standard Javac") {
                    detected_obf = obf;
                }

                auto findings = BackdoorHunter::scan_class(cf);
                all_findings.insert(all_findings.end(), findings.begin(), findings.end());
            }
        }

        auto end_t = std::chrono::high_resolution_clock::now();
        double elapsed_ms = std::chrono::duration<double, std::milli>(end_t - start_t).count();

        // Calculate threat score
        int danger_score = 0;
        for (const auto& f : all_findings) {
            if (f.severity == "CRITICAL") danger_score += 35;
            else if (f.severity == "HIGH") danger_score += 20;
            else if (f.severity == "MEDIUM") danger_score += 10;
            else danger_score += 5;
        }
        if (danger_score > 100) danger_score = 100;

        // Print human summary to stdout
        print_banner();
        std::cout << "[+] Target JAR: " << input_jar << "\n";
        std::cout << "[+] Scanned Classes: " << class_count << " classes in " << elapsed_ms << " ms\n";
        std::cout << "[+] Obfuscation: " << detected_obf << "\n";
        std::cout << "[+] Threat Level: " << danger_score << "/100 ("
                  << (danger_score >= 60 ? "DANGEROUS" : (danger_score >= 20 ? "SUSPICIOUS" : "CLEAN")) << ")\n";
        std::cout << "[+] Total Findings: " << all_findings.size() << "\n\n";

        for (const auto& f : all_findings) {
            std::cout << "  [" << f.severity << "] " << f.category << "\n";
            std::cout << "    Class: " << f.class_name << "\n";
            std::cout << "    Method: " << f.method_name << "\n";
            std::cout << "    Instruction: " << f.instruction_hex << "\n";
            std::cout << "    Description: " << f.description << "\n";
            if (!f.snippet.empty()) {
                std::cout << "    Snippet:\n" << f.snippet << "\n";
            }
            std::cout << "  --------------------------------------------------\n";
        }

        // Export JSON if requested
        if (!output_path.empty()) {
            std::ofstream jf(output_path);
            jf << "{\n";
            jf << "  \"target\": \"" << escape_json(input_jar) << "\",\n";
            jf << "  \"total_classes\": " << class_count << ",\n";
            jf << "  \"obfuscator\": \"" << escape_json(detected_obf) << "\",\n";
            jf << "  \"danger_score\": " << danger_score << ",\n";
            jf << "  \"findings_count\": " << all_findings.size() << ",\n";
            jf << "  \"findings\": [\n";
            for (size_t i = 0; i < all_findings.size(); ++i) {
                const auto& f = all_findings[i];
                jf << "    {\n";
                jf << "      \"category\": \"" << escape_json(f.category) << "\",\n";
                jf << "      \"severity\": \"" << escape_json(f.severity) << "\",\n";
                jf << "      \"class\": \"" << escape_json(f.class_name) << "\",\n";
                jf << "      \"method\": \"" << escape_json(f.method_name) << "\",\n";
                jf << "      \"offset\": " << f.offset << ",\n";
                jf << "      \"instruction\": \"" << escape_json(f.instruction_hex) << "\",\n";
                jf << "      \"description\": \"" << escape_json(f.description) << "\"\n";
                jf << "    }" << (i + 1 < all_findings.size() ? "," : "") << "\n";
            }
            jf << "  ]\n";
            jf << "}\n";
            std::cout << "[+] Saved JSON audit report to: " << output_path << "\n";
        }

    } else if (mode == "protect") {
        print_banner();
        std::cout << "[*] Running Bytecode Armor Protection Pipeline...\n";

        ArmorOptions opts;
        opts.strip_metadata = strip_lvt;
        opts.encrypt_strings = encrypt_strings;
        opts.anti_decompile = anti_decompile;
        opts.encryption_seed = BytecodeArmor::generate_build_key();

        ArmorStats total_stats;
        size_t processed_classes = 0;

        for (auto& entry : entries) {
            if (!entry.is_class || entry.data.empty()) continue;

            ClassFile cf;
            if (cf.parse(entry.data.data(), entry.data.size())) {
                processed_classes++;
                ArmorStats s = BytecodeArmor::protect_class(cf, opts);
                total_stats.stripped_attributes += s.stripped_attributes;
                total_stats.encrypted_strings += s.encrypted_strings;
                total_stats.obfuscated_methods += s.obfuscated_methods;

                // Re-serialize modified bytecode
                entry.data = cf.serialize();
                entry.uncompressed_size = static_cast<uint32_t>(entry.data.size());
                entry.compressed_size = static_cast<uint32_t>(entry.data.size());
                entry.compression_method = 0; // STORED
            }
        }

        std::cout << "[+] Protected " << processed_classes << " classes successfully.\n";
        std::cout << "    - Stripped Debug Attributes: " << total_stats.stripped_attributes << "\n";
        std::cout << "    - Encrypted String Literals: " << total_stats.encrypted_strings << "\n";
        std::cout << "    - Injected Anti-Decompile Traps: " << total_stats.obfuscated_methods << "\n";

        if (output_path.empty()) {
            output_path = input_jar.substr(0, input_jar.find_last_of('.')) + "_protected.jar";
        }

        // Write output JAR with rebuilt entries
        if (JarArchive::write_entries(output_path, entries)) {
            std::cout << "[+] Protected JAR successfully saved to: " << output_path << "\n";
        } else {
            std::cerr << "[!] Error writing output JAR: " << output_path << "\n";
            return 1;
        }
    }

    return 0;
}
