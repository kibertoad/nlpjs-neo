# Sentiment Analysis

The sentiment analysis module scores a phrase using a sentiment dictionary, with support for
negations in the languages that provide them. Three dictionary types are used, AFINN,
Senticon and Pattern; Senticon is preferred when the language has it, then AFINN, then
Pattern. The per-language coverage is in
[Language Support](./language-support.md#sentiment-analysis).

## SentimentAnalyzer

Use `SentimentAnalyzer` to score a phrase in a known locale. The locale is the second
argument and defaults to `en`.

```javascript
import { SentimentAnalyzer } from 'node-nlp-neo';

const sentiment = new SentimentAnalyzer();

console.log(await sentiment.getSentiment('I like cats'));
// {
//   score: 0.344,
//   numWords: 3,
//   numHits: 1,
//   average: 0.11466666666666665,
//   type: 'senticon',
//   locale: 'en',
//   vote: 'positive'
// }

console.log(await sentiment.getSentiment('cats are stupid'));
// {
//   score: -0.25,
//   numWords: 3,
//   numHits: 1,
//   average: -0.08333333333333333,
//   type: 'senticon',
//   locale: 'en',
//   vote: 'negative'
// }
```

The fields are:

| Field | Meaning |
| ----- | ------- |
| `score` | Sum of the scores of the words found in the dictionary |
| `numWords` | Number of words of the phrase |
| `numHits` | Number of words that were found in the dictionary |
| `average` | `score` divided by `numWords` |
| `type` | Dictionary used: `senticon`, `afinn` or `pattern` |
| `locale` | Locale the phrase was scored with |
| `vote` | `positive`, `negative` or `neutral`, derived from the sign of `score` |

## SentimentManager

`SentimentManager` scores phrases in several languages, taking the locale as its first
argument. It returns the same information with the field names used by the `NlpManager`
result: `comparative` instead of `average` and `language` instead of `locale`.

```javascript
import { SentimentManager } from 'node-nlp-neo';

const sentiment = new SentimentManager();

console.log(await sentiment.process('en', 'I like cats'));
// {
//   score: 0.344,
//   comparative: 0.11466666666666665,
//   vote: 'positive',
//   numWords: 3,
//   numHits: 1,
//   type: 'senticon',
//   language: 'en'
// }

console.log(await sentiment.process('es', 'Los gatitos son amor'));
// {
//   score: 0.375,
//   comparative: 0.09375,
//   vote: 'positive',
//   numWords: 4,
//   numHits: 2,
//   type: 'senticon',
//   language: 'es'
// }
```

## Inside the NLP Manager

`NlpManager.process()` runs the sentiment analysis as part of the pipeline and returns it in
the `sentiment` property of the result, so you rarely need these classes directly. See the
[NLP Manager](./nlp-manager.md) documentation.
