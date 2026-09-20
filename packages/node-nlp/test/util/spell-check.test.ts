import { SpellCheck } from '../../src/index.js';

describe('Similar Search', () => {
  describe('Constructor', () => {
    test('An instance can be created', () => {
      const spellCheck = new SpellCheck({ word: 1, more: 1, other: 2 });
      expect(spellCheck).toBeDefined();
    });
  });

  describe('Check token', () => {
    test('If the token already exists, return the token', () => {
      const spellCheck = new SpellCheck({ word: 1, other: 2 });
      const actual = spellCheck.checkToken('word', 1);
      expect(actual).toEqual('word');
    });
    test('If the token is smaller than 4 return then token', () => {
      const spellCheck = new SpellCheck({ word: 1, other: 2 });
      const actual = spellCheck.checkToken('wor', 1);
      expect(actual).toEqual('wor');
    });
    test('If exists a similar feature, return this similar feature', () => {
      const spellCheck = new SpellCheck({ word: 1, other: 2 });
      const actual = spellCheck.checkToken('world', 1);
      expect(actual).toEqual('word');
    });
    test('If not exists a similar feature, return this input token', () => {
      const spellCheck = new SpellCheck({ word: 1, other: 2 });
      const actual = spellCheck.checkToken('mandate', 1);
      expect(actual).toEqual('mandate');
    });
    test('If there are several similar features, return the one with more similar length', () => {
      const spellCheck = new SpellCheck({
        wording: 1,
        workin: 1,
        workingo: 1,
        other: 2,
      });
      const actual = spellCheck.checkToken('working', 1);
      expect(actual).toEqual('wording');
    });
  });
});
