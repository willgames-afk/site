 ;Video Tester, Constantly paints the screen with color
 ;vasm6502_oldstyle -Fbin -dotdir -thing.s
 .org $8000
 valueLo: 0
 valueHi: 1
 colorByte: 2
reset:
 LDA #2
 STA valueHi
 LDA #1
 STA colorByte

loop:
  LDA colorByte
  STA (valueLo,x)
  LDA valueLo
  CLC
  ADC #1
  PHP
  STA valueLo
  PLP
  BCC loop
  INC valueHi
  LDA valueHi
  CMP #06
  BNE loop
  LDA #02
  STA valueHi
  INC colorByte
  JMP loop

 .org $fffc
 .word $8000