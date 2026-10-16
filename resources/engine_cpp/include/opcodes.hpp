#pragma once
#include <cstdint>
#include <string>

namespace nanoguard {

enum Opcode : uint8_t {
    NOP = 0x00,
    ACONST_NULL = 0x01,
    ICONST_M1 = 0x02,
    ICONST_0 = 0x03,
    ICONST_1 = 0x04,
    ICONST_2 = 0x05,
    ICONST_3 = 0x06,
    ICONST_4 = 0x07,
    ICONST_5 = 0x08,
    LCONST_0 = 0x09,
    LCONST_1 = 0x0A,
    FCONST_0 = 0x0B,
    FCONST_1 = 0x0C,
    FCONST_2 = 0x0D,
    DCONST_0 = 0x0E,
    DCONST_1 = 0x0F,
    BIPUSH = 0x10,
    SIPUSH = 0x11,
    LDC = 0x12,
    LDC_W = 0x13,
    LDC2_W = 0x14,
    ILOAD = 0x15,
    LLOAD = 0x16,
    FLOAD = 0x17,
    DLOAD = 0x18,
    ALOAD = 0x19,
    ILOAD_0 = 0x1A,
    ILOAD_1 = 0x1B,
    ILOAD_2 = 0x1C,
    ILOAD_3 = 0x1D,
    ALOAD_0 = 0x2A,
    ALOAD_1 = 0x2B,
    ALOAD_2 = 0x2C,
    ALOAD_3 = 0x2D,
    ISTORE = 0x36,
    LSTORE = 0x37,
    FSTORE = 0x38,
    DSTORE = 0x39,
    ASTORE = 0x3A,
    ISTORE_0 = 0x3B,
    ISTORE_1 = 0x3C,
    ISTORE_2 = 0x3D,
    ISTORE_3 = 0x3E,
    ASTORE_0 = 0x4B,
    ASTORE_1 = 0x4C,
    ASTORE_2 = 0x4D,
    ASTORE_3 = 0x4E,
    POP = 0x57,
    POP2 = 0x58,
    DUP = 0x59,
    DUP_X1 = 0x5A,
    DUP_X2 = 0x5B,
    DUP2 = 0x5C,
    SWAP = 0x5F,
    IADD = 0x60,
    ISUB = 0x64,
    IXOR = 0x82,
    IINC = 0x84,
    IFEQ = 0x99,
    IFNE = 0x9A,
    IFLT = 0x9B,
    IFGE = 0x9C,
    IFGT = 0x9D,
    IFLE = 0x9E,
    IF_ICMPEQ = 0x9F,
    IF_ICMPNE = 0xA0,
    IF_ICMPLT = 0xA1,
    IF_ICMPGE = 0xA2,
    IF_ICMPGT = 0xA3,
    IF_ICMPLE = 0xA4,
    IF_ACMPEQ = 0xA5,
    IF_ACMPNE = 0xA6,
    GOTO = 0xA7,
    JSR = 0xA8,
    RET = 0xA9,
    TABLESWITCH = 0xAA,
    LOOKUPSWITCH = 0xAB,
    IRETURN = 0xAC,
    LRETURN = 0xAD,
    FRETURN = 0xAE,
    DRETURN = 0xAF,
    ARETURN = 0xB0,
    RETURN = 0xB1,
    GETSTATIC = 0xB2,
    PUTSTATIC = 0xB3,
    GETFIELD = 0xB4,
    PUTFIELD = 0xB5,
    INVOKEVIRTUAL = 0xB6,
    INVOKESPECIAL = 0xB7,
    INVOKESTATIC = 0xB8,
    INVOKEINTERFACE = 0xB9,
    INVOKEDYNAMIC = 0xBA,
    NEW = 0xBB,
    NEWARRAY = 0xBC,
    ANEWARRAY = 0xBD,
    ARRAYLENGTH = 0xBE,
    ATHROW = 0xBF,
    CHECKCAST = 0xC0,
    INSTANCEOF = 0xC1,
    MONITORENTER = 0xC2,
    MONITOREXIT = 0xC3,
    WIDE = 0xC4,
    MULTIANEWARRAY = 0xC5,
    IFNULL = 0xC6,
    IFNONNULL = 0xC7,
    GOTO_W = 0xC8,
    JSR_W = 0xC9
};

inline const char* opcode_to_string(uint8_t op) {
    switch (op) {
        case NOP: return "nop";
        case ACONST_NULL: return "aconst_null";
        case ICONST_0: return "iconst_0";
        case ICONST_1: return "iconst_1";
        case BIPUSH: return "bipush";
        case SIPUSH: return "sipush";
        case LDC: return "ldc";
        case LDC_W: return "ldc_w";
        case LDC2_W: return "ldc2_w";
        case ILOAD: return "iload";
        case ALOAD: return "aload";
        case ALOAD_0: return "aload_0";
        case ALOAD_1: return "aload_1";
        case ISTORE: return "istore";
        case ASTORE: return "astore";
        case POP: return "pop";
        case DUP: return "dup";
        case IXOR: return "ixor";
        case IFEQ: return "ifeq";
        case IFNE: return "ifne";
        case IF_ICMPEQ: return "if_icmpeq";
        case IF_ICMPNE: return "if_icmpne";
        case GOTO: return "goto";
        case RETURN: return "return";
        case ARETURN: return "areturn";
        case IRETURN: return "ireturn";
        case GETSTATIC: return "getstatic";
        case PUTSTATIC: return "putstatic";
        case GETFIELD: return "getfield";
        case PUTFIELD: return "putfield";
        case INVOKEVIRTUAL: return "invokevirtual";
        case INVOKESPECIAL: return "invokespecial";
        case INVOKESTATIC: return "invokestatic";
        case INVOKEINTERFACE: return "invokeinterface";
        case INVOKEDYNAMIC: return "invokedynamic";
        case NEW: return "new";
        case CHECKCAST: return "checkcast";
        case ATHROW: return "athrow";
        case IFNULL: return "ifnull";
        case IFNONNULL: return "ifnonnull";
        case GOTO_W: return "goto_w";
        default: return "unknown_op";
    }
}

} // namespace nanoguard
