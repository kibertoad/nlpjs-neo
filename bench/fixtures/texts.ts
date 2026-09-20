/**
 * Text fixtures shared by the benchmarks. They are deliberately plain English
 * chat traffic: the shapes the tokenizers, stemmers and extractors see in
 * production, rather than synthetic strings that the engines short-circuit on.
 */

/** A handful of words, the common case for a chatbot utterance. */
export const shortUtterance = 'what is the name of your application';

/** Contractions and punctuation, the slow path of the English tokenizer. */
export const mediumUtterance =
  "I'd like to know the name of your app, but I can't find it and I've been looking for a while";

/** A paragraph, to measure how the per-utterance cost scales with length. */
export const longText =
  'The support team answers questions about the application every day. ' +
  'People ask when the beta starts, who develops the product, where the offices are and how much the subscription costs. ' +
  "Most of them are in a hurry, so they write short sentences, they don't use punctuation and they misspell half of the words. " +
  'A good assistant still has to understand what they meant and answer before they lose their patience.';

/** Accents and combining marks, which force the normalizer down its unicode path. */
export const accentedUtterance =
  '¿Dónde está la estación de trenes más próxima a la avenida principal?';

/** Distinct utterances, to measure a cold path that a per-text cache cannot serve. */
export const utterances = [
  'what does your company develop',
  'how is your app called',
  'do you have a beta program',
  'who are the developers of this',
  'how can I contact support',
  'what is the price of the subscription',
  'I want to cancel my account',
  'the application crashes when I open it',
  'can you send me the invoice again',
  'where can I download the latest version',
  'is there a discount for students',
  'how do I reset my password',
  'my payment was rejected twice',
  'when is the next release coming out',
  'does it work without an internet connection',
  'thanks for the quick answer',
];

/** Already tokenized text, for the steps that start from tokens. */
export const tokens = [
  'the',
  'application',
  'crashed',
  'while',
  'downloading',
  'the',
  'newest',
  'invoices',
  'and',
  'the',
  'developers',
  'are',
  'rewriting',
  'the',
  'connection',
  'handling',
];

/** Misspellings, the input a spell checker actually has to work on. */
export const misspelledTokens = [
  'aplication',
  'developr',
  'downlod',
  'invoce',
  'connecton',
  'subscripton',
  'pasword',
  'compnay',
];
