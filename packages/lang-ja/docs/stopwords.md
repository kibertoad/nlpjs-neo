# StopwordsJa

|                   |                                  |
| ----------------- | -------------------------------- |
| **Class**         | `StopwordsJa`                    |
| **Extends**       | `Stopwords` (`@nlpjs-neo/core`)  |
| **Container key** | `stopwords-ja`                   |
| **File**          | `src/stopwords-ja.ts`            |

A list of the Japanese words that carry the least meaning: particles, auxiliary verbs,
conjunctions and demonstratives. They are removed before the features of a text are extracted,
so the classifier looks at the words that tell utterances apart.

## Default list

The list holds 109 entries. It is in `src/stopwords-ja.ts`, and this is what is in it, by
grammatical role.

**Particles (助詞):** の に は を が で て と から へ か ば も や な など ので のみ なら ほど まで
より ながら たり でも では にて

**Auxiliary verbs and light verbs (助動詞・動詞):** た し れ さ せ ず い う ら き つ ある いる する
れる なる られる せる できる です だ だっ ます ん あり あっ おり なっ なり なかっ なく でき
いう られ

**Negation:** ない

**Conjunctions (接続詞):** しかし そして ただし または および 及び さらに なお

**Demonstratives and pronouns (指示語):** この その これ それ これら ここ

**Nouns and phrases:** こと もの ものの ところ ため よう また とき うち ほか たち それぞれ
ほとんど かつて 特に お その後 その他

**Compound particles:** として という といった とも とともに と共に について によって
により による において における に関する に対して に対する

## API

### Constructor

```js
new StopwordsJa(container?, words?)
```

| Parameter   | Type       | Description                                 |
| ----------- | ---------- | ------------------------------------------- |
| `container` | `Container` | The container, set when `LangJa` registers it |
| `words`     | `string[]` | A list to use in place of the default one   |

```js
import { StopwordsJa } from '@nlpjs-neo/lang-ja';

const custom = new StopwordsJa(undefined, ['は', 'を', 'が']);
```

### Inherited methods

They come from the core `Stopwords`.

| Method                    | Description                                        |
| ------------------------- | -------------------------------------------------- |
| `build(list)`             | adds the words of an array to the dictionary       |
| `isStopword(word)`        | `true` when the word is in the dictionary          |
| `isNotStopword(word)`     | the opposite                                       |
| `removeStopwords(tokens)` | the tokens that are not stopwords                  |

```js
const stopwords = new StopwordsJa();

stopwords.isStopword('の'); // true
stopwords.isStopword('東京'); // false

stopwords.removeStopwords(['東京', 'は', '日本', 'の', '首都']);
// ['東京', '日本', '首都']
```

The comparison is exact, and the stopwords are written in the script they usually take
(hiragana, and kanji for `及び`, `特に`). The stemmer answers katakana readings, so those
tokens are not matched by this list. Use the list with the tokenizer, or build one of readings.

In a pipeline, the step removes stopwords only when `settings.keepStopwords` is `false`.

---

← [Back to overview](index.md)
