# Language Guesser

The `Language` class guesses the language of a text from its trigrams. `guess` returns every
candidate language ordered by descending score.

```javascript
import { Language } from 'node-nlp-neo';

const language = new Language();
const guess = language.guess(
  'When the night has come And the land is dark And the moon is the only light we see',
);
console.log(guess[0]);
// { alpha3: 'eng', alpha2: 'en', language: 'English', score: 1 }
```

The second parameter is an allow list of accepted locales, so the best fit among them is
returned, and the third parameter limits the number of results:

```javascript
import { Language } from 'node-nlp-neo';

const language = new Language();

const limited = language.guess(
  "Quan arriba la nit i la terra és fosca i la lluna és l'única llum que podem veure",
  null,
  3,
);
console.log(limited.length); // 3
console.log(limited[0]);
// { alpha3: 'cat', alpha2: 'ca', language: 'Catalan', score: 1 }

const allowed = language.guess(
  'When the night has come And the land is dark And the moon is the only light we see',
  ['de', 'es'],
);
console.log(allowed[0]);
// { alpha3: 'deu', alpha2: 'de', language: 'German', score: 1 }
```

`guessBest` returns only the best result instead of the list, and takes the same allow list:

```javascript
import { Language } from 'node-nlp-neo';

const language = new Language();

console.log(language.guessBest('When the night has come And the land is dark And the moon is the only light we see'));
// { alpha3: 'eng', alpha2: 'en', language: 'English', score: 1 }

console.log(
  language.guessBest(
    'When the night has come And the land is dark And the moon is the only light we see',
    ['de', 'es'],
  ),
);
// { alpha3: 'deu', alpha2: 'de', language: 'German', score: 1 }
```

If you only need the language guesser, install `@nlpjs-neo/language` instead of
`node-nlp-neo`, which keeps the dependency much smaller:

```bash
pnpm add @nlpjs-neo/language
```

```javascript
import { Language } from '@nlpjs-neo/language';
```

`@nlpjs-neo/language-min` exposes the same class without the trigram models, so it only
guesses once it has been trained with your own sentences. That is what the NLU uses
internally; for standalone guessing use `@nlpjs-neo/language`.

Inside an NLP pipeline the guesser is trained with the trigrams of your corpus on top of the
built-in ones, so a multi-language bot routes utterances to the right model automatically,
and even invented languages are guessed once they have been trained.
