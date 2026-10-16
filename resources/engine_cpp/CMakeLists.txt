cmake_minimum_required(VERSION 3.15)
project(nanoguard_engine VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

if(MSVC)
    add_compile_options(/W4 /O2 /permissive- /utf-8 /MT)
else()
    add_compile_options(-Wall -Wextra -O3 -static)
endif()

include_directories(include)

add_executable(nanoguard
    src/main.cpp
)

set_target_properties(nanoguard PROPERTIES
    OUTPUT_NAME "nanoguard"
    RUNTIME_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/bin"
)
