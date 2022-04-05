# Potassium

Potassium (Henceforth abbreviated to K) is a programming language based on
Javascript but it incorporates features from other languages to make it a
better language.

## Name

Potassium is meant to be Javascript but better. Javascript starts with J,
and K is the next letter after that. Also, my last name starts with a K-
So I considered naming the language K. But a quick google later revealed
that there was already a K programming language, so I decided to call it
Potassium, (the element K corrosponds to on the periodic table) in
official situations and then abbreviate it to K when necessary.

## The Potassium Runtime Compiler

Potassium is intended to be a runtime-compiled language- Basically, you
(as the developer) do a precompile which spits out a bytecode-adjacent
file, which you distribute directly. Then, the end user uses the Potassium
Runtime Compiler (AKA the Potato) to finish the compilation.

This means that as a developer any code you make is cross-platform with
no extra work- It will run on anything, even completely different
architectures.

### But wouldn't it be annoying to have to compile every time I want to use some software?

No, because the Potato caches the result of the compilation- You only
have to compile once. Also, there's an option in the precompiler to wrap
the bytecode in a small executable that will automatically launch the
Potato- You do need to install the Potato, but that's a one time thing.

## Syntax

Programs are constructed from lines, which contain various instructions.

### Assignment

```potasssium
k = "abc"
int x = 0
<type> <variable-name> = <value>
```

In most cases, a type doesn't need to be specified- type inference!

## Example

```potassium
k = 3
print(k)
```
