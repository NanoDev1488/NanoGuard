#pragma once
#include <cstdint>
#include <string>
#include <vector>
#include <memory>
#include <stdexcept>
#include <cstring>
#include <unordered_map>

namespace nanoguard {

enum ConstantTag : uint8_t {
    CONSTANT_Utf8 = 1,
    CONSTANT_Integer = 3,
    CONSTANT_Float = 4,
    CONSTANT_Long = 5,
    CONSTANT_Double = 6,
    CONSTANT_Class = 7,
    CONSTANT_String = 8,
    CONSTANT_Fieldref = 9,
    CONSTANT_Methodref = 10,
    CONSTANT_InterfaceMethodref = 11,
    CONSTANT_NameAndType = 12,
    CONSTANT_MethodHandle = 15,
    CONSTANT_MethodType = 16,
    CONSTANT_Dynamic = 17,
    CONSTANT_InvokeDynamic = 18,
    CONSTANT_Module = 19,
    CONSTANT_Package = 20
};

enum AccessFlags : uint16_t {
    ACC_PUBLIC = 0x0001,
    ACC_PRIVATE = 0x0002,
    ACC_PROTECTED = 0x0004,
    ACC_STATIC = 0x0008,
    ACC_FINAL = 0x0010,
    ACC_SYNCHRONIZED = 0x0020,
    ACC_BRIDGE = 0x0040,
    ACC_VARARGS = 0x0080,
    ACC_NATIVE = 0x0100,
    ACC_INTERFACE = 0x0200,
    ACC_ABSTRACT = 0x0400,
    ACC_STRICT = 0x0800,
    ACC_SYNTHETIC = 0x1000,
    ACC_ANNOTATION = 0x2000,
    ACC_ENUM = 0x4000
};

struct CpEntry {
    uint8_t tag = 0;
    std::string utf8_val;
    uint32_t int_val = 0;
    float float_val = 0.0f;
    uint64_t long_val = 0;
    double double_val = 0.0;
    uint16_t class_index = 0;
    uint16_t string_index = 0;
    uint16_t name_and_type_index = 0;
    uint16_t class_or_interface_index = 0;
    uint8_t ref_kind = 0;
    uint16_t bootstrap_method_attr_index = 0;
};

struct ExceptionTableEntry {
    uint16_t start_pc = 0;
    uint16_t end_pc = 0;
    uint16_t handler_pc = 0;
    uint16_t catch_type = 0;
};

struct AttributeInfo {
    uint16_t attribute_name_index = 0;
    std::vector<uint8_t> info;

    // Parsed Code Attribute if attribute name is "Code"
    bool is_code = false;
    uint16_t max_stack = 0;
    uint16_t max_locals = 0;
    std::vector<uint8_t> code;
    std::vector<ExceptionTableEntry> exception_table;
    std::vector<AttributeInfo> sub_attributes;
};

struct FieldOrMethodInfo {
    uint16_t access_flags = 0;
    uint16_t name_index = 0;
    uint16_t descriptor_index = 0;
    std::vector<AttributeInfo> attributes;
};

class BinaryReader {
public:
    const uint8_t* data;
    size_t size;
    size_t offset;

    BinaryReader(const uint8_t* d, size_t s) : data(d), size(s), offset(0) {}

    bool has_bytes(size_t n) const { return offset + n <= size; }

    uint8_t read_u1() {
        if (offset >= size) throw std::runtime_error("Unexpected EOF while reading u1");
        return data[offset++];
    }

    uint16_t read_u2() {
        if (offset + 2 > size) throw std::runtime_error("Unexpected EOF while reading u2");
        uint16_t val = (static_cast<uint16_t>(data[offset]) << 8) | static_cast<uint16_t>(data[offset + 1]);
        offset += 2;
        return val;
    }

    uint32_t read_u4() {
        if (offset + 4 > size) throw std::runtime_error("Unexpected EOF while reading u4");
        uint32_t val = (static_cast<uint32_t>(data[offset]) << 24) |
                       (static_cast<uint32_t>(data[offset + 1]) << 16) |
                       (static_cast<uint32_t>(data[offset + 2]) << 8) |
                       static_cast<uint32_t>(data[offset + 3]);
        offset += 4;
        return val;
    }

    void read_bytes(uint8_t* dest, size_t n) {
        if (offset + n > size) throw std::runtime_error("Unexpected EOF while reading bytes");
        std::memcpy(dest, data + offset, n);
        offset += n;
    }

    std::vector<uint8_t> read_vec(size_t n) {
        if (offset + n > size) throw std::runtime_error("Unexpected EOF while reading vector");
        std::vector<uint8_t> v(data + offset, data + offset + n);
        offset += n;
        return v;
    }
};

class BinaryWriter {
public:
    std::vector<uint8_t> buf;

    void write_u1(uint8_t v) {
        buf.push_back(v);
    }

    void write_u2(uint16_t v) {
        buf.push_back(static_cast<uint8_t>((v >> 8) & 0xFF));
        buf.push_back(static_cast<uint8_t>(v & 0xFF));
    }

    void write_u4(uint32_t v) {
        buf.push_back(static_cast<uint8_t>((v >> 24) & 0xFF));
        buf.push_back(static_cast<uint8_t>((v >> 16) & 0xFF));
        buf.push_back(static_cast<uint8_t>((v >> 8) & 0xFF));
        buf.push_back(static_cast<uint8_t>(v & 0xFF));
    }

    void write_bytes(const uint8_t* src, size_t n) {
        buf.insert(buf.end(), src, src + n);
    }

    void write_vec(const std::vector<uint8_t>& v) {
        buf.insert(buf.end(), v.begin(), v.end());
    }
};

class ClassFile {
public:
    uint32_t magic = 0xCAFEBABE;
    uint16_t minor_version = 0;
    uint16_t major_version = 52; // Java 8 default
    std::vector<CpEntry> constant_pool; // 1-indexed! Index 0 is unused dummy.
    uint16_t access_flags = 0;
    uint16_t this_class = 0;
    uint16_t super_class = 0;
    std::vector<uint16_t> interfaces;
    std::vector<FieldOrMethodInfo> fields;
    std::vector<FieldOrMethodInfo> methods;
    std::vector<AttributeInfo> attributes;

    std::string get_utf8(uint16_t idx) const {
        if (idx == 0 || idx >= constant_pool.size()) return "";
        if (constant_pool[idx].tag == CONSTANT_Utf8) {
            return constant_pool[idx].utf8_val;
        }
        return "";
    }

    std::string get_class_name(uint16_t class_idx) const {
        if (class_idx == 0 || class_idx >= constant_pool.size()) return "";
        if (constant_pool[class_idx].tag == CONSTANT_Class) {
            return get_utf8(constant_pool[class_idx].class_index);
        }
        return "";
    }

    uint16_t add_utf8(const std::string& str) {
        for (size_t i = 1; i < constant_pool.size(); ++i) {
            if (constant_pool[i].tag == CONSTANT_Utf8 && constant_pool[i].utf8_val == str) {
                return static_cast<uint16_t>(i);
            }
        }
        CpEntry entry;
        entry.tag = CONSTANT_Utf8;
        entry.utf8_val = str;
        constant_pool.push_back(entry);
        return static_cast<uint16_t>(constant_pool.size() - 1);
    }

    uint16_t add_string(const std::string& str) {
        uint16_t u_idx = add_utf8(str);
        for (size_t i = 1; i < constant_pool.size(); ++i) {
            if (constant_pool[i].tag == CONSTANT_String && constant_pool[i].string_index == u_idx) {
                return static_cast<uint16_t>(i);
            }
        }
        CpEntry entry;
        entry.tag = CONSTANT_String;
        entry.string_index = u_idx;
        constant_pool.push_back(entry);
        return static_cast<uint16_t>(constant_pool.size() - 1);
    }

    uint16_t add_class(const std::string& internal_name) {
        uint16_t u_idx = add_utf8(internal_name);
        for (size_t i = 1; i < constant_pool.size(); ++i) {
            if (constant_pool[i].tag == CONSTANT_Class && constant_pool[i].class_index == u_idx) {
                return static_cast<uint16_t>(i);
            }
        }
        CpEntry entry;
        entry.tag = CONSTANT_Class;
        entry.class_index = u_idx;
        constant_pool.push_back(entry);
        return static_cast<uint16_t>(constant_pool.size() - 1);
    }

    bool parse(const uint8_t* data, size_t size) {
        if (size < 10) return false;
        BinaryReader r(data, size);
        magic = r.read_u4();
        if (magic != 0xCAFEBABE) return false;

        minor_version = r.read_u2();
        major_version = r.read_u2();

        uint16_t cp_count = r.read_u2();
        constant_pool.clear();
        constant_pool.resize(1); // 0th dummy

        for (uint16_t i = 1; i < cp_count; ++i) {
            uint8_t tag = r.read_u1();
            CpEntry cp;
            cp.tag = tag;

            switch (tag) {
                case CONSTANT_Utf8: {
                    uint16_t len = r.read_u2();
                    std::vector<uint8_t> s = r.read_vec(len);
                    cp.utf8_val = std::string(s.begin(), s.end());
                    constant_pool.push_back(cp);
                    break;
                }
                case CONSTANT_Integer:
                    cp.int_val = r.read_u4();
                    constant_pool.push_back(cp);
                    break;
                case CONSTANT_Float:
                    cp.int_val = r.read_u4();
                    constant_pool.push_back(cp);
                    break;
                case CONSTANT_Long:
                case CONSTANT_Double:
                    cp.long_val = (static_cast<uint64_t>(r.read_u4()) << 32) | r.read_u4();
                    constant_pool.push_back(cp);
                    // Long and Double take two slots in JVM constant pool
                    constant_pool.emplace_back();
                    i++;
                    break;
                case CONSTANT_Class:
                    cp.class_index = r.read_u2();
                    constant_pool.push_back(cp);
                    break;
                case CONSTANT_String:
                    cp.string_index = r.read_u2();
                    constant_pool.push_back(cp);
                    break;
                case CONSTANT_Fieldref:
                case CONSTANT_Methodref:
                case CONSTANT_InterfaceMethodref:
                    cp.class_or_interface_index = r.read_u2();
                    cp.name_and_type_index = r.read_u2();
                    constant_pool.push_back(cp);
                    break;
                case CONSTANT_NameAndType:
                    cp.class_or_interface_index = r.read_u2(); // name index
                    cp.name_and_type_index = r.read_u2();      // descriptor index
                    constant_pool.push_back(cp);
                    break;
                case CONSTANT_MethodHandle:
                    cp.ref_kind = r.read_u1();
                    cp.class_or_interface_index = r.read_u2();
                    constant_pool.push_back(cp);
                    break;
                case CONSTANT_MethodType:
                    cp.class_or_interface_index = r.read_u2();
                    constant_pool.push_back(cp);
                    break;
                case CONSTANT_Dynamic:
                case CONSTANT_InvokeDynamic:
                    cp.bootstrap_method_attr_index = r.read_u2();
                    cp.name_and_type_index = r.read_u2();
                    constant_pool.push_back(cp);
                    break;
                case CONSTANT_Module:
                case CONSTANT_Package:
                    cp.class_index = r.read_u2();
                    constant_pool.push_back(cp);
                    break;
                default:
                    return false;
            }
        }

        access_flags = r.read_u2();
        this_class = r.read_u2();
        super_class = r.read_u2();

        uint16_t if_count = r.read_u2();
        interfaces.resize(if_count);
        for (uint16_t i = 0; i < if_count; ++i) {
            interfaces[i] = r.read_u2();
        }

        auto read_attributes = [&](std::vector<AttributeInfo>& attrs) {
            uint16_t attr_count = r.read_u2();
            attrs.resize(attr_count);
            for (uint16_t i = 0; i < attr_count; ++i) {
                attrs[i].attribute_name_index = r.read_u2();
                uint32_t len = r.read_u4();
                std::string attr_name = get_utf8(attrs[i].attribute_name_index);
                if (attr_name == "Code") {
                    attrs[i].is_code = true;
                    attrs[i].max_stack = r.read_u2();
                    attrs[i].max_locals = r.read_u2();
                    uint32_t code_len = r.read_u4();
                    attrs[i].code = r.read_vec(code_len);
                    uint16_t ex_count = r.read_u2();
                    attrs[i].exception_table.resize(ex_count);
                    for (uint16_t e = 0; e < ex_count; ++e) {
                        attrs[i].exception_table[e].start_pc = r.read_u2();
                        attrs[i].exception_table[e].end_pc = r.read_u2();
                        attrs[i].exception_table[e].handler_pc = r.read_u2();
                        attrs[i].exception_table[e].catch_type = r.read_u2();
                    }
                    uint16_t sub_count = r.read_u2();
                    attrs[i].sub_attributes.resize(sub_count);
                    for (uint16_t s = 0; s < sub_count; ++s) {
                        attrs[i].sub_attributes[s].attribute_name_index = r.read_u2();
                        uint32_t slen = r.read_u4();
                        attrs[i].sub_attributes[s].info = r.read_vec(slen);
                    }
                } else {
                    attrs[i].info = r.read_vec(len);
                }
            }
        };

        uint16_t f_count = r.read_u2();
        fields.resize(f_count);
        for (uint16_t i = 0; i < f_count; ++i) {
            fields[i].access_flags = r.read_u2();
            fields[i].name_index = r.read_u2();
            fields[i].descriptor_index = r.read_u2();
            read_attributes(fields[i].attributes);
        }

        uint16_t m_count = r.read_u2();
        methods.resize(m_count);
        for (uint16_t i = 0; i < m_count; ++i) {
            methods[i].access_flags = r.read_u2();
            methods[i].name_index = r.read_u2();
            methods[i].descriptor_index = r.read_u2();
            read_attributes(methods[i].attributes);
        }

        read_attributes(attributes);
        return true;
    }

    std::vector<uint8_t> serialize() const {
        BinaryWriter w;
        w.write_u4(magic);
        w.write_u2(minor_version);
        w.write_u2(major_version);

        w.write_u2(static_cast<uint16_t>(constant_pool.size()));
        for (size_t i = 1; i < constant_pool.size(); ++i) {
            const auto& cp = constant_pool[i];
            w.write_u1(cp.tag);
            switch (cp.tag) {
                case CONSTANT_Utf8:
                    w.write_u2(static_cast<uint16_t>(cp.utf8_val.size()));
                    w.write_bytes(reinterpret_cast<const uint8_t*>(cp.utf8_val.data()), cp.utf8_val.size());
                    break;
                case CONSTANT_Integer:
                case CONSTANT_Float:
                    w.write_u4(cp.int_val);
                    break;
                case CONSTANT_Long:
                case CONSTANT_Double:
                    w.write_u4(static_cast<uint32_t>((cp.long_val >> 32) & 0xFFFFFFFF));
                    w.write_u4(static_cast<uint32_t>(cp.long_val & 0xFFFFFFFF));
                    i++; // skip next slot
                    break;
                case CONSTANT_Class:
                    w.write_u2(cp.class_index);
                    break;
                case CONSTANT_String:
                    w.write_u2(cp.string_index);
                    break;
                case CONSTANT_Fieldref:
                case CONSTANT_Methodref:
                case CONSTANT_InterfaceMethodref:
                    w.write_u2(cp.class_or_interface_index);
                    w.write_u2(cp.name_and_type_index);
                    break;
                case CONSTANT_NameAndType:
                    w.write_u2(cp.class_or_interface_index);
                    w.write_u2(cp.name_and_type_index);
                    break;
                case CONSTANT_MethodHandle:
                    w.write_u1(cp.ref_kind);
                    w.write_u2(cp.class_or_interface_index);
                    break;
                case CONSTANT_MethodType:
                    w.write_u2(cp.class_or_interface_index);
                    break;
                case CONSTANT_Dynamic:
                case CONSTANT_InvokeDynamic:
                    w.write_u2(cp.bootstrap_method_attr_index);
                    w.write_u2(cp.name_and_type_index);
                    break;
                case CONSTANT_Module:
                case CONSTANT_Package:
                    w.write_u2(cp.class_index);
                    break;
            }
        }

        w.write_u2(access_flags);
        w.write_u2(this_class);
        w.write_u2(super_class);

        w.write_u2(static_cast<uint16_t>(interfaces.size()));
        for (uint16_t iface : interfaces) {
            w.write_u2(iface);
        }

        auto write_attributes = [&](const std::vector<AttributeInfo>& attrs) {
            w.write_u2(static_cast<uint16_t>(attrs.size()));
            for (const auto& a : attrs) {
                w.write_u2(a.attribute_name_index);
                if (a.is_code) {
                    BinaryWriter code_w;
                    code_w.write_u2(a.max_stack);
                    code_w.write_u2(a.max_locals);
                    code_w.write_u4(static_cast<uint32_t>(a.code.size()));
                    code_w.write_vec(a.code);

                    code_w.write_u2(static_cast<uint16_t>(a.exception_table.size()));
                    for (const auto& ex : a.exception_table) {
                        code_w.write_u2(ex.start_pc);
                        code_w.write_u2(ex.end_pc);
                        code_w.write_u2(ex.handler_pc);
                        code_w.write_u2(ex.catch_type);
                    }

                    code_w.write_u2(static_cast<uint16_t>(a.sub_attributes.size()));
                    for (const auto& sub : a.sub_attributes) {
                        code_w.write_u2(sub.attribute_name_index);
                        code_w.write_u4(static_cast<uint32_t>(sub.info.size()));
                        code_w.write_vec(sub.info);
                    }

                    w.write_u4(static_cast<uint32_t>(code_w.buf.size()));
                    w.write_vec(code_w.buf);
                } else {
                    w.write_u4(static_cast<uint32_t>(a.info.size()));
                    w.write_vec(a.info);
                }
            }
        };

        w.write_u2(static_cast<uint16_t>(fields.size()));
        for (const auto& f : fields) {
            w.write_u2(f.access_flags);
            w.write_u2(f.name_index);
            w.write_u2(f.descriptor_index);
            write_attributes(f.attributes);
        }

        w.write_u2(static_cast<uint16_t>(methods.size()));
        for (const auto& m : methods) {
            w.write_u2(m.access_flags);
            w.write_u2(m.name_index);
            w.write_u2(m.descriptor_index);
            write_attributes(m.attributes);
        }

        write_attributes(attributes);
        return w.buf;
    }
};

} // namespace nanoguard
