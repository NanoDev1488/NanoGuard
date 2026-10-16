cmake_minimum_required(VERSION 3.15)
project(nanoguard_engine VERSION 0.1.0 LANGUAGES C CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

if(MSVC)
    add_compile_options(/W3 /O2 /permissive- /utf-8 /MT)
elseif(APPLE)
    add_compile_options(-Wall -Wextra -O3)
else()
    add_compile_options(-Wall -Wextra -O3)
    set(CMAKE_EXE_LINKER_FLAGS "${CMAKE_EXE_LINKER_FLAGS} -static -static-libgcc -static-libstdc++")
endif()

include_directories(include)

add_executable(nanoguard
    src/main.cpp
    src/miniz.c
)

set_target_properties(nanoguard PROPERTIES
    OUTPUT_NAME "nanoguard"
    RUNTIME_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/bin"
)
