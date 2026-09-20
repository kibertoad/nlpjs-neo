import { chunk } from './korean-chunker.js';
import { initDicts, dictionary } from './korean-dictionary.js';

import {
  isName,
  isKoreanNumber,
  isKoreanNameVariation,
} from './korean-substantive.js';
import type { KoreanToken } from './korean-token.js';

function getTopSlice(word: string): string {
  initDicts();
  const max = Math.min(word.length, 2);
  for (let i = max; i > 1; i -= 1) {
    const slice = word.slice(0, i);
    if (isName(slice)) {
      return slice;
    }
    if (isKoreanNumber(slice)) {
      return slice;
    }
    if (isKoreanNameVariation(slice)) {
      return slice;
    }
    if (dictionary[slice]) {
      return slice;
    }
  }
  return word[0];
}

function isHangulChar(ch: string): boolean {
  const regex =
    /[\u1100-\u11FF\u302E\u302F\u3131-\u318E\u3200-\u321E\u3260-\u327E\uA960-\uA97C\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uFFA0-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]/g;
  return regex.test(ch);
}

function buildPotentials(word: KoreanToken): string[] {
  if (!isHangulChar(word.text[0])) {
    return [word.text];
  }
  const potentials: string[] = [];
  let pending = word.text;
  while (pending.length > 0) {
    const top = getTopSlice(pending);
    potentials.push(top);
    pending = pending.slice(top.length);
  }
  return potentials;
}

function tokenize(text: string): string[] {
  const chunks = chunk(text);
  const result: string[] = [];
  for (let i = 0; i < chunks.length; i += 1) {
    const potentials = buildPotentials(chunks[i]);
    for (let j = 0; j < potentials.length; j += 1) {
      result.push(potentials[j]);
    }
  }
  return result;
}

function stemWord(token: string): string {
  initDicts();
  const value = dictionary[token];
  if (value) {
    return value.root || token;
  }
  return token;
}

export { tokenize, stemWord };
