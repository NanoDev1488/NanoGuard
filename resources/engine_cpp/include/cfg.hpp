#pragma once
#include "classfile.hpp"
#include "opcodes.hpp"
#include <vector>
#include <string>
#include <sstream>
#include <iomanip>

namespace nanoguard {

struct Instruction {
    size_t offset = 0;
    uint8_t opcode = 0;
    std::vector<uint8_t> operands;
    int32_t target_offset = -1; // for branches
    std::string disassembly;

    std::string to_string() const {
        std::ostringstream oss;
        oss << "0x" << std::hex << std::setw(4) << std::setfill('0') << offset << ": "
            << opcode_to_string(opcode);
        if (!disassembly.empty()) {
            oss << " " << disassembly;
        }
        return oss.str();
    }
};

struct BasicBlock {
    size_t id = 0;
    size_t start_pc = 0;
    size_t end_pc = 0;
    std::vector<Instruction> instructions;
    std::vector<size_t> successors;
    std::vector<size_t> predecessors;
};

class ControlFlowGraph {
public:
    std::vector<Instruction> instructions;
    std::vector<BasicBlock> blocks;

    static ControlFlowGraph build(const ClassFile& cf, const std::vector<uint8_t>& code) {
        ControlFlowGraph cfg;
        size_t pc = 0;
        size_t n = code.size();

        while (pc < n) {
            size_t cur_pc = pc;
            uint8_t op = code[pc++];
            Instruction inst;
            inst.offset = cur_pc;
            inst.opcode = op;

            switch (op) {
                case NOP:
                case ACONST_NULL:
                case ICONST_M1:
                case ICONST_0:
                case ICONST_1:
                case ICONST_2:
                case ICONST_3:
                case ICONST_4:
                case ICONST_5:
                case LCONST_0:
                case LCONST_1:
                case FCONST_0:
                case FCONST_1:
                case FCONST_2:
                case DCONST_0:
                case DCONST_1:
                case ILOAD_0:
                case ILOAD_1:
                case ILOAD_2:
                case ILOAD_3:
                case ALOAD_0:
                case ALOAD_1:
                case ALOAD_2:
                case ALOAD_3:
                case ISTORE_0:
                case ISTORE_1:
                case ISTORE_2:
                case ISTORE_3:
                case ASTORE_0:
                case ASTORE_1:
                case ASTORE_2:
                case ASTORE_3:
                case POP:
                case POP2:
                case DUP:
                case DUP_X1:
                case DUP_X2:
                case DUP2:
                case SWAP:
                case IADD:
                case ISUB:
                case IXOR:
                case IRETURN:
                case LRETURN:
                case FRETURN:
                case DRETURN:
                case ARETURN:
                case RETURN:
                case ARRAYLENGTH:
                case ATHROW:
                case MONITORENTER:
                case MONITOREXIT:
                    break;

                case BIPUSH:
                    if (pc < n) {
                        int8_t b = static_cast<int8_t>(code[pc++]);
                        inst.operands.push_back(static_cast<uint8_t>(b));
                        inst.disassembly = std::to_string(b);
                    }
                    break;

                case SIPUSH:
                    if (pc + 1 < n) {
                        int16_t s = (static_cast<int16_t>(code[pc]) << 8) | code[pc + 1];
                        pc += 2;
                        inst.disassembly = std::to_string(s);
                    }
                    break;

                case LDC:
                    if (pc < n) {
                        uint8_t cpidx = code[pc++];
                        inst.operands.push_back(cpidx);
                        if (cpidx < cf.constant_pool.size()) {
                            const auto& cp = cf.constant_pool[cpidx];
                            if (cp.tag == CONSTANT_String) {
                                inst.disassembly = "\"" + cf.get_utf8(cp.string_index) + "\"";
                            }
                        }
                    }
                    break;

                case LDC_W:
                case LDC2_W:
                    if (pc + 1 < n) {
                        uint16_t cpidx = (static_cast<uint16_t>(code[pc]) << 8) | code[pc + 1];
                        pc += 2;
                        if (cpidx < cf.constant_pool.size()) {
                            const auto& cp = cf.constant_pool[cpidx];
                            if (cp.tag == CONSTANT_String) {
                                inst.disassembly = "\"" + cf.get_utf8(cp.string_index) + "\"";
                            }
                        }
                    }
                    break;

                case ILOAD:
                case LLOAD:
                case FLOAD:
                case DLOAD:
                case ALOAD:
                case ISTORE:
                case LSTORE:
                case FSTORE:
                case DSTORE:
                case ASTORE:
                case RET:
                    if (pc < n) {
                        uint8_t local = code[pc++];
                        inst.disassembly = "var_" + std::to_string(local);
                    }
                    break;

                case IINC:
                    if (pc + 1 < n) {
                        uint8_t idx = code[pc++];
                        int8_t c = static_cast<int8_t>(code[pc++]);
                        inst.disassembly = "var_" + std::to_string(idx) + " += " + std::to_string(c);
                    }
                    break;

                case IFEQ:
                case IFNE:
                case IFLT:
                case IFGE:
                case IFGT:
                case IFLE:
                case IF_ICMPEQ:
                case IF_ICMPNE:
                case IF_ICMPLT:
                case IF_ICMPGE:
                case IF_ICMPGT:
                case IF_ICMPLE:
                case IF_ACMPEQ:
                case IF_ACMPNE:
                case IFNULL:
                case IFNONNULL:
                case GOTO:
                case JSR:
                    if (pc + 1 < n) {
                        int16_t branch = (static_cast<int16_t>(code[pc]) << 8) | code[pc + 1];
                        pc += 2;
                        inst.target_offset = static_cast<int32_t>(cur_pc) + branch;
                        std::ostringstream ss;
                        ss << "-> 0x" << std::hex << inst.target_offset;
                        inst.disassembly = ss.str();
                    }
                    break;

                case GETSTATIC:
                case PUTSTATIC:
                case GETFIELD:
                case PUTFIELD:
                case INVOKEVIRTUAL:
                case INVOKESPECIAL:
                case INVOKESTATIC:
                case NEW:
                case CHECKCAST:
                case INSTANCEOF:
                    if (pc + 1 < n) {
                        uint16_t cpidx = (static_cast<uint16_t>(code[pc]) << 8) | code[pc + 1];
                        pc += 2;
                        if (cpidx < cf.constant_pool.size()) {
                            const auto& cp = cf.constant_pool[cpidx];
                            if (cp.tag == CONSTANT_Methodref || cp.tag == CONSTANT_InterfaceMethodref || cp.tag == CONSTANT_Fieldref) {
                                std::string cls = cf.get_class_name(cp.class_or_interface_index);
                                uint16_t nt = cp.name_and_type_index;
                                if (nt < cf.constant_pool.size() && cf.constant_pool[nt].tag == CONSTANT_NameAndType) {
                                    std::string mname = cf.get_utf8(cf.constant_pool[nt].class_or_interface_index);
                                    std::string mdesc = cf.get_utf8(cf.constant_pool[nt].name_and_type_index);
                                    inst.disassembly = cls + "." + mname + mdesc;
                                }
                            } else if (cp.tag == CONSTANT_Class) {
                                inst.disassembly = cf.get_utf8(cp.class_index);
                            }
                        }
                    }
                    break;

                case INVOKEINTERFACE:
                    if (pc + 3 < n) {
                        uint16_t cpidx = (static_cast<uint16_t>(code[pc]) << 8) | code[pc + 1];
                        pc += 4; // 2 index + count + 0
                        if (cpidx < cf.constant_pool.size()) {
                            const auto& cp = cf.constant_pool[cpidx];
                            std::string cls = cf.get_class_name(cp.class_or_interface_index);
                            uint16_t nt = cp.name_and_type_index;
                            if (nt < cf.constant_pool.size() && cf.constant_pool[nt].tag == CONSTANT_NameAndType) {
                                std::string mname = cf.get_utf8(cf.constant_pool[nt].class_or_interface_index);
                                std::string mdesc = cf.get_utf8(cf.constant_pool[nt].name_and_type_index);
                                inst.disassembly = cls + "." + mname + mdesc;
                            }
                        }
                    }
                    break;

                case INVOKEDYNAMIC:
                    if (pc + 3 < n) {
                        pc += 4;
                        inst.disassembly = "[invokedynamic]";
                    }
                    break;

                default:
                    // Advance safely
                    break;
            }

            cfg.instructions.push_back(inst);
        }

        return cfg;
    }
};

} // namespace nanoguard
