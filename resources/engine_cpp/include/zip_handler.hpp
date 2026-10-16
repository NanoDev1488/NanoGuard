#pragma once
#include <cstdint>
#include <string>
#include <vector>
#include <fstream>
#include <iostream>
#include <cstring>
#include <memory>

namespace nanoguard {

#pragma pack(push, 1)
struct ZipLocalHeader {
    uint32_t signature; // 0x04034b50
    uint16_t version_needed;
    uint16_t flags;
    uint16_t compression_method;
    uint16_t last_mod_time;
    uint16_t last_mod_date;
    uint32_t crc32;
    uint32_t compressed_size;
    uint32_t uncompressed_size;
    uint16_t filename_len;
    uint16_t extra_len;
};

struct ZipCentralHeader {
    uint32_t signature; // 0x02014b50
    uint16_t version_made_by;
    uint16_t version_needed;
    uint16_t flags;
    uint16_t compression_method;
    uint16_t last_mod_time;
    uint16_t last_mod_date;
    uint32_t crc32;
    uint32_t compressed_size;
    uint32_t uncompressed_size;
    uint16_t filename_len;
    uint16_t extra_len;
    uint16_t comment_len;
    uint16_t disk_num_start;
    uint16_t internal_attr;
    uint32_t external_attr;
    uint32_t local_header_offset;
};

struct ZipEndOfCentralDir {
    uint32_t signature; // 0x06054b50
    uint16_t disk_num;
    uint16_t cd_start_disk;
    uint16_t total_entries_disk;
    uint16_t total_entries;
    uint32_t cd_size;
    uint32_t cd_offset;
    uint16_t comment_len;
};
#pragma pack(pop)

struct JarEntry {
    std::string filename;
    uint32_t uncompressed_size = 0;
    uint32_t compressed_size = 0;
    uint16_t compression_method = 0;
    uint32_t crc32 = 0;
    uint32_t local_offset = 0;
    std::vector<uint8_t> data; // raw data (stored if method == 0)
    bool is_class = false;
};

class JarArchive {
public:
    std::string path;
    std::vector<JarEntry> entries;

    static bool read_file(const std::string& filepath, std::vector<uint8_t>& out) {
        std::ifstream file(filepath, std::ios::binary | std::ios::ate);
        if (!file.is_open()) return false;
        std::streamsize sz = file.tellg();
        file.seekg(0, std::ios::beg);
        out.resize(static_cast<size_t>(sz));
        return file.read(reinterpret_cast<char*>(out.data()), sz).good();
    }

    static inline uint32_t calculate_crc32(const uint8_t* data, size_t length) {
        static uint32_t table[256];
        static bool have_table = false;
        if (!have_table) {
            for (uint32_t i = 0; i < 256; ++i) {
                uint32_t rem = i;
                for (uint32_t j = 0; j < 8; ++j) {
                    if (rem & 1) rem = (rem >> 1) ^ 0xEDB88320;
                    else rem >>= 1;
                }
                table[i] = rem;
            }
            have_table = true;
        }
        uint32_t crc = 0xFFFFFFFF;
        for (size_t i = 0; i < length; ++i) {
            crc = (crc >> 8) ^ table[(crc ^ data[i]) & 0xFF];
        }
        return crc ^ 0xFFFFFFFF;
    }

    static bool write_file(const std::string& filepath, const std::vector<uint8_t>& in) {
        std::ofstream file(filepath, std::ios::binary);
        if (!file.is_open()) return false;
        file.write(reinterpret_cast<const char*>(in.data()), in.size());
        return file.good();
    }

    static bool write_entries(const std::string& filepath, const std::vector<JarEntry>& entries) {
        std::ofstream file(filepath, std::ios::binary);
        if (!file.is_open()) return false;

        std::vector<uint32_t> local_offsets;
        std::vector<uint32_t> crc_list;
        local_offsets.reserve(entries.size());
        crc_list.reserve(entries.size());

        for (const auto& entry : entries) {
            uint32_t current_offset = static_cast<uint32_t>(file.tellp());
            local_offsets.push_back(current_offset);

            uint32_t crc = calculate_crc32(entry.data.data(), entry.data.size());
            crc_list.push_back(crc);

            ZipLocalHeader loc{};
            loc.signature = 0x04034b50;
            loc.version_needed = 20;
            loc.flags = 0;
            loc.compression_method = 0;
            loc.last_mod_time = 0x4800;
            loc.last_mod_date = 0x5421;
            loc.crc32 = crc;
            loc.compressed_size = static_cast<uint32_t>(entry.data.size());
            loc.uncompressed_size = static_cast<uint32_t>(entry.data.size());
            loc.filename_len = static_cast<uint16_t>(entry.filename.size());
            loc.extra_len = 0;

            file.write(reinterpret_cast<const char*>(&loc), sizeof(loc));
            file.write(entry.filename.data(), entry.filename.size());
            if (!entry.data.empty()) {
                file.write(reinterpret_cast<const char*>(entry.data.data()), entry.data.size());
            }
        }

        uint32_t cd_offset = static_cast<uint32_t>(file.tellp());
        for (size_t i = 0; i < entries.size(); ++i) {
            const auto& entry = entries[i];
            ZipCentralHeader cd{};
            cd.signature = 0x02014b50;
            cd.version_made_by = 20;
            cd.version_needed = 20;
            cd.flags = 0;
            cd.compression_method = 0;
            cd.last_mod_time = 0x4800;
            cd.last_mod_date = 0x5421;
            cd.crc32 = crc_list[i];
            cd.compressed_size = static_cast<uint32_t>(entry.data.size());
            cd.uncompressed_size = static_cast<uint32_t>(entry.data.size());
            cd.filename_len = static_cast<uint16_t>(entry.filename.size());
            cd.extra_len = 0;
            cd.comment_len = 0;
            cd.disk_num_start = 0;
            cd.internal_attr = 0;
            cd.external_attr = 0;
            cd.local_header_offset = local_offsets[i];

            file.write(reinterpret_cast<const char*>(&cd), sizeof(cd));
            file.write(entry.filename.data(), entry.filename.size());
        }
        uint32_t cd_size = static_cast<uint32_t>(file.tellp()) - cd_offset;

        ZipEndOfCentralDir eocd{};
        eocd.signature = 0x06054b50;
        eocd.disk_num = 0;
        eocd.cd_start_disk = 0;
        eocd.total_entries_disk = static_cast<uint16_t>(entries.size());
        eocd.total_entries = static_cast<uint16_t>(entries.size());
        eocd.cd_size = cd_size;
        eocd.cd_offset = cd_offset;
        eocd.comment_len = 0;

        file.write(reinterpret_cast<const char*>(&eocd), sizeof(eocd));
        return file.good();
    }

    static bool parse_entries(const std::vector<uint8_t>& buffer, std::vector<JarEntry>& out_entries) {
        if (buffer.size() < sizeof(ZipEndOfCentralDir)) return false;

        // Search backward for End of Central Directory signature: 0x06054b50
        size_t eocd_pos = 0;
        bool found = false;
        for (size_t i = buffer.size() - sizeof(ZipEndOfCentralDir); i > 0; --i) {
            uint32_t sig = *reinterpret_cast<const uint32_t*>(&buffer[i]);
            if (sig == 0x06054b50) {
                eocd_pos = i;
                found = true;
                break;
            }
        }
        if (!found) return false;

        const ZipEndOfCentralDir* eocd = reinterpret_cast<const ZipEndOfCentralDir*>(&buffer[eocd_pos]);
        size_t cd_offset = eocd->cd_offset;
        uint16_t count = eocd->total_entries;

        size_t cur = cd_offset;
        for (uint16_t i = 0; i < count; ++i) {
            if (cur + sizeof(ZipCentralHeader) > buffer.size()) break;
            const ZipCentralHeader* cd = reinterpret_cast<const ZipCentralHeader*>(&buffer[cur]);
            if (cd->signature != 0x02014b50) break;

            cur += sizeof(ZipCentralHeader);
            if (cur + cd->filename_len > buffer.size()) break;

            std::string name(reinterpret_cast<const char*>(&buffer[cur]), cd->filename_len);
            cur += cd->filename_len + cd->extra_len + cd->comment_len;

            JarEntry entry;
            entry.filename = name;
            entry.uncompressed_size = cd->uncompressed_size;
            entry.compressed_size = cd->compressed_size;
            entry.compression_method = cd->compression_method;
            entry.crc32 = cd->crc32;
            entry.local_offset = cd->local_header_offset;
            entry.is_class = (name.length() > 6 && name.substr(name.length() - 6) == ".class");

            // Read raw entry data from local header
            if (entry.local_offset + sizeof(ZipLocalHeader) <= buffer.size()) {
                const ZipLocalHeader* loc = reinterpret_cast<const ZipLocalHeader*>(&buffer[entry.local_offset]);
                size_t data_pos = entry.local_offset + sizeof(ZipLocalHeader) + loc->filename_len + loc->extra_len;
                if (data_pos + entry.compressed_size <= buffer.size()) {
                    entry.data.assign(&buffer[data_pos], &buffer[data_pos + entry.compressed_size]);
                }
            }

            out_entries.push_back(std::move(entry));
        }

        return true;
    }
};

} // namespace nanoguard
