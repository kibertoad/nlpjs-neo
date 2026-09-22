---
'@nlpjs-neo/evaluator': minor
---

Templates gain sections, `_iterator_` arrays and native values.

`{{#items}} ... {{/#}}` repeats its content for each item of an array, and sees
`_current_`, `_index_` and `_parent_`. A section takes any expression, so
`{{#order.items}}` works as well, and a value that is missing or falsy repeats
over nothing, which makes `{{#flag}} ... {{/#}}` read as a condition. An array
item with `_iterator_: '#items'` is repeated the same way, over the same
expressions.

`compile` takes a `native` option so that a string which is exactly one
`{{ expression }}` answers the value itself, a number or an object included.
Its result is typed as `unknown`, since what the expression answers is only
known while it runs. Without the option, strings still answer text, as before.

An object inside a longer string is now printed as JSON instead of
`[object Object]`, and an array as its items printed the same way.

Parsed templates are kept in a bounded cache, so a long-lived process that
renders arbitrary strings no longer grows an entry for each one of them.
