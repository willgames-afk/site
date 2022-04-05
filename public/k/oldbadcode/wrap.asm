; Assembly Language Hello World

; In Intex Syntax
; For Macos
; (Mach-O 64 object file)

; Assemble with NASM
; (nasm -f macho64 helloworld.s,
;  ld -macosx_version_min 10.7.0 -lSystem -o hello hello.o)

.global start
section .text
start:
	mov rax, 0x2000004 ;Write Instruction (2, because it's a BSD syscall, and 4, because that's BSD's syscall number for write)
	mov rdi, 1;Write to stdout
	mov rsi, msg ;address where our message lives
	mov rdx, msg.len
	syscall ;Print it!
	mov rax, 0x2000001 ;Exit
	mov rdi, 0         ;With status 0?
	syscall

section .data
msg: db "Hello, World!", 10 ; hello world, followed by a newline
.len  equ $ - msg