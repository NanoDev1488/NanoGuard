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

    static bool write_file(const std::string& filepath, const std::vector<uint8_t>& in) {
        std::ofstream file(filepath, std::ios::binary);
        if (!file.is_open()) return false;
        file.write(reinterpret_cast<const char*>(in.data()), in.size());
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
