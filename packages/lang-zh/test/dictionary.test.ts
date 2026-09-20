import { Dictionary } from '../src/dictionary.js';

describe('Chinese dictionary', () => {
  test('Compiles a corpus with a trailing newline', () => {
    const dictionary = new Dictionary();
    dictionary.cedict = '傳統 简化 [jian3 hua4] /simplified/\n';

    dictionary.start();

    expect(dictionary.search('简化')).toEqual([
      {
        traditional: '傳統',
        simplified: '简化',
        pinyin: 'jian3 hua4',
        definition: 'simplified',
      },
    ]);
  });
});
