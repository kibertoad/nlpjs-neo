/*
 * Copyright (c) AXA Group Operations Spain S.A.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { Container } from '@nlpjs-neo/core';
import { LangJa } from '../src/index.js';

/**
 * Characterization tests for the kuromoji-backed stemmer. Everything here is
 * the output of the tokenizer and of the keigo rules on top of it, so these
 * assertions are what a change of tokenizer has to reproduce.
 */
/**
 * The fields of a token this library actually consumes. The tokenizer returns
 * a good deal more per token (dictionary ids, costs, conjugation tables), and
 * pinning those would make these tests a test of kuromoji rather than of us.
 */
const pick = (tokens: any[]) =>
  tokens.map(({ surface_form, reading, pronunciation, pos }) => ({
    surface_form,
    reading,
    pronunciation,
    pos,
  }));

describe('Stemmer Japanese', () => {
  let stemmer: any;

  beforeAll(async () => {
    const container = new Container();
    container.use(LangJa);
    stemmer = container.get('stemmer-ja');
    await stemmer.init();
  });

  describe('Kana helpers', () => {
    test('It should convert katakana to hiragana', () => {
      expect(stemmer.toHiragana('コンニチハ')).toEqual('こんにちは');
    });
    test('It should convert hiragana to katakana', () => {
      expect(stemmer.toKatakana('こんにちは')).toEqual('コンニチハ');
    });
    test('It should classify characters', () => {
      expect(stemmer.isHiraganaChar('あ')).toBeTruthy();
      expect(stemmer.isKatakanaChar('ア')).toBeTruthy();
      expect(stemmer.isKanjiChar('私')).toBeTruthy();
      expect(stemmer.isKanaChar('私')).toBeFalsy();
      expect(stemmer.isJapaneseChar('a')).toBeFalsy();
    });
    test('It should detect the scripts a string contains', () => {
      expect(stemmer.hasHiragana('寿司をたべる')).toBeTruthy();
      expect(stemmer.hasKatakana('スシ')).toBeTruthy();
      expect(stemmer.hasKana('寿司')).toBeFalsy();
      expect(stemmer.hasKanji('寿司')).toBeTruthy();
      expect(stemmer.hasJapanese('sushi')).toBeFalsy();
    });
  });

  describe('To romaji', () => {
    test('It should transliterate kana', () => {
      expect(stemmer.toRomaji('コンニチハ')).toEqual('konnichiha');
    });
    test('It should keep a syllabic n before a vowel or a y-kana separate', () => {
      expect(stemmer.toRomaji('ホンヤ')).toEqual('honya');
    });
  });

  describe('Parse', () => {
    test('It should return one token per word with its reading and part of speech', () => {
      expect(pick(stemmer.parse('私は元気です'))).toEqual([
        {
          surface_form: '私',
          reading: 'ワタシ',
          pronunciation: 'ワタシ',
          pos: '名詞',
        },
        { surface_form: 'は', reading: 'ハ', pronunciation: 'ワ', pos: '助詞' },
        {
          surface_form: '元気',
          reading: 'ゲンキ',
          pronunciation: 'ゲンキ',
          pos: '名詞',
        },
        {
          surface_form: 'です',
          reading: 'デス',
          pronunciation: 'デス',
          pos: '助動詞',
        },
      ]);
    });
    test('It should merge a volitional auxiliary into the verb it follows', () => {
      expect(pick(stemmer.parse('行こう'))).toEqual([
        {
          surface_form: '行こう',
          reading: 'イコウ',
          pronunciation: 'イコー',
          pos: '動詞',
        },
      ]);
    });
    test('It should merge a verb ending in a sokuon with the auxiliary that follows it', () => {
      expect(pick(stemmer.parse('本を買った'))).toEqual([
        {
          surface_form: '本',
          reading: 'ホン',
          pronunciation: 'ホン',
          pos: '名詞',
        },
        { surface_form: 'を', reading: 'ヲ', pronunciation: 'ヲ', pos: '助詞' },
        {
          surface_form: '買った',
          reading: 'カッタ',
          pronunciation: 'カッタ',
          pos: '動詞',
        },
      ]);
    });
    test('It should not merge a sokuon verb followed by a particle', () => {
      expect(
        stemmer.parse('行ってきます').map((token) => token.surface_form)
      ).toEqual(['行っ', 'て', 'き', 'ます']);
    });
  });

  describe('Convert', () => {
    test('It should convert a sentence to katakana', () => {
      expect(stemmer.convertToKatakana('東京へ行きます')).toEqual(
        'トウキョウ ヘ イキ マス'
      );
    });
    test('It should convert a sentence to romaji', () => {
      expect(stemmer.convertToRomaji('東京へ行きます')).toEqual(
        'toukyou he iki masu'
      );
    });
  });

  describe('Formality level', () => {
    test('It should rewrite a teineigo verb to its plain form and count it', () => {
      const result = stemmer.formalityLevel('お寿司を食べます');
      expect(result.tokens).toEqual(['オ', 'スシ', 'ヲ', 'タベ', 'マス']);
      expect(result.informalTokens).toEqual(['オ', 'スシ', 'ヲ', 'タベル']);
      expect(result.counts).toEqual({
        keigo: 1,
        teineigo: 1,
        sonkeigo: 0,
        kenjougo: 0,
        informal: 0,
      });
      expect(result.isKeigo).toBeTruthy();
    });
    test('It should count a sonkeigo chain and replace it with the plain verb', () => {
      const result = stemmer.formalityLevel('お休みになる');
      expect(result.informalTokens).toEqual(['ネル']);
      expect(result.counts).toEqual({
        keigo: 1,
        teineigo: 0,
        sonkeigo: 1,
        kenjougo: 0,
        informal: 0,
      });
      expect(result.isKeigo).toBeTruthy();
    });
    test('It should leave a plain sentence alone', () => {
      const result = stemmer.formalityLevel('寿司を食べる');
      expect(result.tokens).toEqual(['スシ', 'ヲ', 'タベル']);
      expect(result.informalTokens).toEqual(['スシ', 'ヲ', 'タベル']);
      expect(result.isKeigo).toBeFalsy();
    });

    test('It should count a teineigo copula', () => {
      const result = stemmer.formalityLevel('元気です');
      expect(result.informalTokens).toEqual(['ゲンキ', 'ダ']);
      expect(result.counts).toEqual({
        keigo: 1,
        teineigo: 1,
        sonkeigo: 0,
        kenjougo: 0,
        informal: 0,
      });
      expect(result.isKeigo).toBeTruthy();
    });

    test('It should count a kenjougo verb and replace it with the plain verb', () => {
      const result = stemmer.formalityLevel('拝見する');
      expect(result.informalTokens).toEqual(['ミル']);
      expect(result.counts).toEqual({
        keigo: 1,
        teineigo: 0,
        sonkeigo: 0,
        kenjougo: 1,
        informal: 0,
      });
      expect(result.isKeigo).toBeTruthy();
    });

    /*
     * `dictionary` entries are synonyms rather than a formality level, and an
     * unknown level would be a typo in `keigo.json`. Neither may reach the
     * counters, which used to take any spelling and yield NaN.
     */
    test('It should not add a counter for a level it does not know', () => {
      for (const text of ['元気です', '拝見する', 'お休みになる', '来る']) {
        const { counts } = stemmer.formalityLevel(text);
        expect(Object.keys(counts).sort()).toEqual([
          'informal',
          'keigo',
          'kenjougo',
          'sonkeigo',
          'teineigo',
        ]);
        expect(Object.values(counts).every(Number.isInteger)).toBe(true);
      }
    });
  });

  describe('Stem', () => {
    test('It should return the plain-form readings of the content words', async () => {
      expect(await stemmer.stem('', { text: '私は寿司を食べます' })).toEqual([
        'ワタシ',
        'スシ',
        'タベル',
      ]);
    });
    test('It should keep the polite form when normalizeFormality is false', async () => {
      expect(
        await stemmer.stem('', {
          text: '私は寿司を食べます',
          normalizeFormality: false,
        })
      ).toEqual(['ワタシ', 'スシ', 'タベ', 'マス']);
    });
    test('It should drop tokens shorter than stemMinLength', async () => {
      expect(
        await stemmer.stem('', { text: '私は寿司を食べます', stemMinLength: 1 })
      ).toEqual(['ワタシ', 'ハ', 'スシ', 'ヲ', 'タベル']);
    });
    test('It should keep numbers when removeNumbers is false', async () => {
      expect(
        await stemmer.stem('', {
          text: '123 寿司 456',
          removeNumbers: false,
          stemMinLength: 1,
        })
      ).toEqual(['123', 'スシ', '456']);
    });
    test('It should strip punctuation', async () => {
      expect(await stemmer.stem('', { text: '寿司、美味しい！' })).toEqual([
        'スシ',
        'オイシイ',
      ]);
    });
  });
});
