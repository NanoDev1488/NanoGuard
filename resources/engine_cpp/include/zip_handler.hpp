#pragma once
#include <cstdint>
#include <string>
#include <vector>
#include <fstream>
#include <iostream>
#include <cstring>
#include <memory>
#include "miniz.h"

namespace nanoguard {

struct JarEntry {
    std::string filename;
    uint32_t uncompressed_size = 0;
    uint32_t compressed_size = 0;
    uint32_t crc32 = 0;
    std::vector<uint8_t> data;
    bool is_class = false;
    bool is_directory = false;
};

class JarArchive {
public:
    static bool read_file(const std::string& filepath, std::vector<uint8_t>& out) {
        std::ifstream file(filepath, std::ios::binary | std::ios::ate);
        if (!file.is_open()) return false;
        std::streamsize sz = file.tellg();
        file.seekg(0, std::ios::beg);
        out.resize(static_cast<size_t>(sz));
        return file.read(reinterpret_cast<char*>(out.data()), sz).good();
    }

    static bool parse_entries(const std::vector<uint8_t>& buffer, std::vector<JarEntry>& out_entries) {
        if (buffer.empty()) return false;

        mz_zip_archive zip_archive;
        std::memset(&zip_archive, 0, sizeof(zip_archive));
        if (!mz_zip_reader_init_mem(&zip_archive, buffer.data(), buffer.size(), 0)) {
            return false;
        }

        mz_uint num_files = mz_zip_reader_get_num_files(&zip_archive);
        out_entries.clear();
        out_entries.reserve(num_files);

        for (mz_uint i = 0; i < num_files; ++i) {
            mz_zip_archive_file_stat stat;
            if (!mz_zip_reader_file_stat(&zip_archive, i, &stat)) continue;

            JarEntry entry;
            entry.filename = stat.m_filename;
            entry.uncompressed_size = static_cast<uint32_t>(stat.m_uncomp_size);
            entry.compressed_size = static_cast<uint32_t>(stat.m_comp_size);
            entry.crc32 = stat.m_crc32;
            entry.is_directory = mz_zip_reader_is_file_a_directory(&zip_archive, i) != 0;
            entry.is_class = (!entry.is_directory && entry.filename.size() > 6 &&
                              entry.filename.compare(entry.filename.size() - 6, 6, ".class") == 0);

            if (!entry.is_directory && stat.m_uncomp_size > 0) {
                entry.data.resize(static_cast<size_t>(stat.m_uncomp_size));
                if (!mz_zip_reader_extract_to_mem(&zip_archive, i, entry.data.data(), entry.data.size(), 0)) {
                    entry.data.clear();
                }
            }

            out_entries.push_back(std::move(entry));
        }

        mz_zip_reader_end(&zip_archive);
        return true;
    }

    static bool write_entries(const std::string& filepath, const std::vector<JarEntry>& entries) {
        mz_zip_archive zip_out;
        std::memset(&zip_out, 0, sizeof(zip_out));
        if (!mz_zip_writer_init_file(&zip_out, filepath.c_str(), 0)) {
            return false;
        }

        bool has_nanoguard_inf = false;

        for (const auto& entry : entries) {
            if (entry.filename == "META-INF/NANOGUARD.INF") has_nanoguard_inf = true;

            if (entry.is_directory || entry.data.empty()) {
                std::string dirname = entry.filename;
                if (!dirname.empty() && dirname.back() != '/') dirname += '/';
                mz_zip_writer_add_mem(&zip_out, dirname.c_str(), nullptr, 0, 0);
            } else {
                mz_zip_writer_add_mem(&zip_out, entry.filename.c_str(), entry.data.data(), entry.data.size(), MZ_DEFAULT_COMPRESSION);
            }
        }

        // Add single NanoGuard marker file inside the protected JAR
        if (!has_nanoguard_inf) {
            std::string inf_content = 
                "Manifest-Version: 1.0\n"
                "Protected-By: NanoGuard Native Bytecode Armor & Backdoor Hunter v0.1.0\n"
                "Author: NanoDev (t.me/WineSquad)\n"
                "Website: https://github.com/NanoDev1488/NanoGuard\n"
                "Contact: t.me/radoqi\n"
                "Armor-Protection: Native-Level-3\n"
                "Status: SECURED\n";
            mz_zip_writer_add_mem(&zip_out, "META-INF/NANOGUARD.INF", inf_content.data(), inf_content.size(), MZ_DEFAULT_COMPRESSION);
        }

        if (!mz_zip_writer_finalize_archive(&zip_out)) {
            mz_zip_writer_end(&zip_out);
            return false;
        }

        mz_zip_writer_end(&zip_out);
        return true;
    }
};

} // namespace nanoguard
