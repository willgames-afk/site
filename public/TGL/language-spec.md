# TGL Language Specification

TGL stands for Tiny Graphics Language, and was designed to be a lightweight replacement for things like HTML and CSS.

Example Program:

```tgl
defaults: web;

text.h1("Title!")
text.p("Hi")

button("Press this button to run JS!") {
    onclick: script.triggerText();
    background-color: 'green';
}

container(
	text.h2("Containers Are Great")
	text.p("They're like <div>s but better.")
){
	background-color: 'red'
	padding: 10px
	margin: 0
}
```
