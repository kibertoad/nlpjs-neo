import { stringToArray } from '@nlpjs-neo/core';
import emojiByName from './emoji.json' with { type: 'json' };

const nonSpacingRegex = new RegExp(String.fromCharCode(65039), 'g');

/** Drops the variation selector, so one emoji has one spelling. */
const strip = (x: string): string => x.replace(nonSpacingRegex, '');

const names = emojiByName as Record<string, string>;
const keys = Object.keys(names);
/** The name of each emoji, keyed by the emoji itself. */
const emojiByCode: Record<string, string> = {};
for (let i = 0; i < keys.length; i += 1) {
  const current = keys[i];
  emojiByCode[strip(names[current])] = current;
}

/** The `:name:` of one character, or the character when it is not an emoji. */
const which = (code: string): string => {
  const word = emojiByCode[strip(code)];
  return word ? `:${word}:` : code;
};

/** Replaces every emoji of a text with its `:name:`. */
const removeEmojis = (str?: string): string | undefined =>
  str
    ? stringToArray(str)
        .map((word) => which(word))
        .join('')
    : str;

export { removeEmojis };
