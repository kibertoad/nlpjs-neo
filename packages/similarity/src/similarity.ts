import leven from './leven.js';

/**
 * Levenshtein distance between two strings, `0` when they are equal.
 * @param normalize Strip diacritics and lowercase both sides first.
 */
function similarity(str1: string, str2: string, normalize = false): number {
  if (normalize) {
    /* oxlint-disable */
    str1 = str1
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
    str2 = str2
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
    /* oxlint-enable */
  }
  return str1 === str2 ? 0 : leven(str1, str2);
}

export default similarity;
