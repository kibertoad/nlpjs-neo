import { BaseStemmer } from '@nlpjs-neo/core';
import type { ContainerHolder } from '@nlpjs-neo/core';

/**
 * The Polish stemmer: a port of `pl_stemmer` by Błażej Kubiński
 * (https://github.com/Tutanchamon/pl_stemmer, MIT license), a simple stemmer
 * for Polish based on Porter's algorithm. It takes off, in turn, the endings
 * of nouns, diminutives, adjectives, verbs, adverbs and plurals. The rules
 * that end in `ą` are not here, because the normalizer has taken the accents
 * off by the time a word is stemmed.
 */
class StemmerPl extends BaseStemmer {
  constructor(container?: ContainerHolder) {
    super(container);
    this.name = 'stemmer-pl';
  }

  stemNoun(word) {
    let slice;
    if (word.length > 7) {
      slice = word.slice(-5);
      if (['zacja', 'zacji'].includes(slice)) {
        return word.slice(0, -4);
      }
    }
    if (word.length > 6) {
      slice = word.slice(-4);
      if (
        ['acja', 'acji', 'tach', 'anie', 'enie', 'eniu', 'aniu'].includes(slice)
      ) {
        return word.slice(0, -4);
      }
      if (slice === 'tyka') {
        return word.slice(0, -2);
      }
    }
    if (word.length > 5) {
      slice = word.slice(-3);
      if (['ach', 'ami', 'nia', 'niu', 'cia', 'ciu'].includes(slice)) {
        return word.slice(0, -3);
      }
      if (['cji', 'cja'].includes(slice)) {
        return word.slice(0, -2);
      }
      slice = word.slice(-2);
      if (['ce', 'ta'].includes(slice)) {
        return word.slice(0, -2);
      }
    }
    return word;
  }

  stemDiminutive(word) {
    let slice;
    if (word.length > 6) {
      slice = word.slice(-5);
      if (['eczek', 'iczek', 'iszek', 'aszek', 'uszek'].includes(slice)) {
        return word.slice(0, -5);
      }
      slice = word.slice(-4);
      if (['enek', 'ejek', 'erek'].includes(slice)) {
        return word.slice(0, -2);
      }
    }
    if (word.length > 4) {
      slice = word.slice(-2);
      if (['ek', 'ak'].includes(slice)) {
        return word.slice(0, -2);
      }
    }
    return word;
  }

  stemAdjective(word) {
    if (word.length > 7 && word.startsWith('naj')) {
      if (word.endsWith('szych')) {
        return word.slice(3, -5);
      }
      if (word.endsWith('sze') || word.endsWith('szy')) {
        return word.slice(3, -3);
      }
    }
    if (word.length > 6 && word.endsWith('czny')) {
      return word.slice(0, -4);
    }
    if (word.length > 5) {
      const slice = word.slice(-3);
      if (['owy', 'owa', 'owe', 'ych', 'ego'].includes(slice)) {
        return word.slice(0, -3);
      }
      if (word.endsWith('ej')) {
        return word.slice(0, -2);
      }
    }
    return word;
  }

  stemVerb(word) {
    let slice = word.slice(-3);
    if (word.length > 5) {
      if (
        [
          'bym',
          'esz',
          'asz',
          'cie',
          'esc',
          'asc',
          'łem',
          'amy',
          'emy',
        ].includes(slice)
      ) {
        return word.slice(0, -3);
      }
    }
    if (word.length > 3) {
      if (
        ['esz', 'asz', 'esc', 'asc'].includes(slice) ||
        ['ec', 'ac'].includes(word.slice(-2))
      ) {
        return word.slice(0, -2);
      }
      slice = word.slice(-2);
      if (slice === 'aj') {
        return word.slice(0, -1);
      }
      if (['ac', 'em', 'am', 'ał', 'ił', 'ic', 'ac'].includes(slice)) {
        return word.slice(0, -2);
      }
    }
    return word;
  }

  stemAdverb(word) {
    if (word.length > 4) {
      const slice = word.slice(-3);
      if (['nie', 'wie', 'rze'].includes(slice)) {
        return word.slice(0, -2);
      }
    }
    return word;
  }

  stemPlural(word) {
    if (word.length > 4) {
      if (word.endsWith('ami')) {
        return word.slice(0, -3);
      }
      if (word.endsWith('ow') || word.endsWith('om')) {
        return word.slice(0, -2);
      }
    }
    return word;
  }

  stemGeneral(word) {
    if (word.length > 4) {
      if (word.endsWith('ia') || word.endsWith('ie')) {
        return word.slice(0, -2);
      }
      if (['u', 'a', 'i', 'e', 'ł', 'y'].includes(word[word.length - 1])) {
        return word.slice(0, -1);
      }
    }
    return word;
  }

  innerStem(): void {
    let current = this.getCurrent();
    current = this.stemNoun(current);
    current = this.stemDiminutive(current);
    current = this.stemAdjective(current);
    current = this.stemVerb(current);
    current = this.stemAdverb(current);
    current = this.stemPlural(current);
    current = this.stemGeneral(current);
    this.setCurrent(current);
  }
}

export default StemmerPl;
