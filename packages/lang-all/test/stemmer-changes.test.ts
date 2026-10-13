import { StemmerAr } from '../../lang-ar/src/index.js';
import { StemmerFi } from '../../lang-fi/src/index.js';
import { StemmerFr } from '../../lang-fr/src/index.js';
import { StemmerHu } from '../../lang-hu/src/index.js';
import { StemmerPt } from '../../lang-pt/src/index.js';
import { StemmerRu } from '../../lang-ru/src/index.js';

/**
 * The stemmers that are generated from Snowball programs answer differently
 * from the ones before them on a few letters. These are those words: where
 * the previous stemmer missed what Snowball stems, and the punctuation that
 * the Arabic program strips because the tokenizer leaves it on the word.
 */
interface Stemmer {
  stemWord(word: string): string;
}

const cases: [string, string, string, Stemmer][] = [
  ['Hungarian', 'adatvédelemről', 'adatvédel', new StemmerHu()],
  ['Hungarian', 'akiktől', 'ak', new StemmerHu()],
  ['Russian', 'актёр', 'актер', new StemmerRu()],
  ['Russian', 'берёза', 'берез', new StemmerRu()],
  ['French', 'aiguë', 'aigu', new StemmerFr()],
  ['French', 'archaïque', 'archa', new StemmerFr()],
  ['Portuguese', 'revolução', 'revolu', new StemmerPt()],
  ['Portuguese', 'execuções', 'execu', new StemmerPt()],
  ['Finnish', 'españa', 'españa', new StemmerFi()],
  ['Arabic', 'أبله،', 'ابل', new StemmerAr()],
  ['Arabic', 'جميل؟', 'جميل', new StemmerAr()],
  ['Arabic', 'نعم٪', 'نعم', new StemmerAr()],
];

describe('Stemmers made from Snowball programs', () => {
  test.each(cases)(
    '%s should stem %s to %s',
    (_language, word, stem, stemmer) => {
      expect(stemmer.stemWord(word)).toEqual(stem);
    }
  );
});
