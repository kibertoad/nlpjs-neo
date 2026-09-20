import BaseStemmer from '../src/base-stemmer.js';

class TestStemmer extends BaseStemmer {
  constructor(container) {
    super(container);
    this.name = 'stemmer-en';
  }

  innerStem() {}
}

describe('BaseStemmer', () => {
  test('removes stopwords when tokenizeAndStem is asked not to keep them', () => {
    const container = {
      get(name) {
        if (name === 'tokenizer-en') {
          return { tokenize: () => ['the', 'cat'] };
        }
        if (name === 'stopwords-en') {
          return {
            removeStopwords: (tokens) => tokens.filter((x) => x !== 'the'),
          };
        }
        return undefined;
      },
    };
    const stemmer = new TestStemmer(container);

    expect(stemmer.tokenizeAndStem('the cat', false)).toEqual(['cat']);
  });
});
