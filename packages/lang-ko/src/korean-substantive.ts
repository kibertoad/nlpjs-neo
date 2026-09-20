import { decomposeHangul, codaMap, composeHangul } from './hangul.js';
import { initDicts, names } from './korean-dictionary.js';

function isName(word) {
  initDicts();
  if (names.Full[word] || names.Given[word]) {
    return true;
  }
  if (
    word.length === 3 &&
    names.Family[word[0]] &&
    names.Given[word.slice(1, 3)]
  ) {
    return true;
  }
  if (
    word.length === 4 &&
    names.Family[word.slice(0, 2)] &&
    names.Given[word.slice(2, 4)]
  ) {
    return true;
  }
  return false;
}

function isKoreanNumber(word) {
  return /^[일이삼사오육칠팔구천백십해경조억만]*[일이삼사오육칠팔구천백십해경조억만원배분초]$/.test(
    word
  );
}

function isKoreanNameVariation(word) {
  if (isName(word)) {
    return true;
  }
  if (word.length < 3 || word.length > 5) {
    return false;
  }
  const decomposed = [...word].map((c) => decomposeHangul(c));
  const lastChar = decomposed[decomposed.length - 1];
  if (!codaMap[lastChar.onset]) {
    return false;
  }
  if (
    lastChar.onset === 'ㅇ' ||
    lastChar.vowel !== 'ㅣ' ||
    lastChar.coda !== ' '
  ) {
    return false;
  }
  if (decomposed[decomposed.length - 2].coda !== ' ') {
    return false;
  }
  const recovered = decomposed
    .map((hc, i) => {
      if (i === word.length - 1) {
        return '이';
      }
      if (i === word.length - 2) {
        return composeHangul(hc.onset, hc.vowel, lastChar.onset);
      }
      return composeHangul(hc.onset, hc.vowel, hc.coda);
    })
    .join('');
  return isName(recovered) || isName(recovered.slice(0, -1));
}

export { isName, isKoreanNumber, isKoreanNameVariation };
