import { BaseStemmer } from '@nlpjs-neo/core';

class StemmerHi extends BaseStemmer {
  declare static suffixes: any;

  constructor(container) {
    super(container);
    this.name = 'stemmer-hi';
  }

  processSuffixes(word) {
    const maxSuffixes = word.length > 5 ? 4 : word.length - 2;
    for (let i = maxSuffixes; i >= 0; i -= 1) {
      const suffixes = StemmerHi.suffixes[i];
      for (let j = 0; j < suffixes.length; j += 1) {
        if (word.endsWith(suffixes[j])) {
          return word.slice(0, -suffixes[j].length);
        }
      }
    }
    return word;
  }

  innerStem() {
    let word = this.getCurrent();
    word = this.processSuffixes(word);
    this.setCurrent(word);
  }
}

StemmerHi.suffixes = [
  ['ो', 'े', 'ू', 'ु', 'ी', 'ि', 'ा'],
  [
    'कर',
    'ाओ',
    'िए',
    'ाई',
    'ाए',
    'ने',
    'नी',
    'ना',
    'ते',
    'ीं',
    'ती',
    'ता',
    'ाँ',
    'ां',
    'ों',
    'ें',
  ],
  [
    'ाकर',
    'ाइए',
    'ाईं',
    'ाया',
    'ेगी',
    'ेगा',
    'ोगी',
    'ोगे',
    'ाने',
    'ाना',
    'ाते',
    'ाती',
    'ाता',
    'तीं',
    'ाओं',
    'ाएं',
    'ुओं',
    'ुएं',
    'ुआं',
  ],
  [
    'ाएगी',
    'ाएगा',
    'ाओगी',
    'ाओगे',
    'एंगी',
    'ेंगी',
    'एंगे',
    'ेंगे',
    'ूंगी',
    'ूंगा',
    'ातीं',
    'नाओं',
    'नाएं',
    'ताओं',
    'ताएं',
    'ियाँ',
    'ियों',
    'ियां',
  ],
  ['ाएंगी', 'ाएंगे', 'ाऊंगी', 'ाऊंगा', 'ाइयाँ', 'ाइयों', 'ाइयां'],
];

export default StemmerHi;
