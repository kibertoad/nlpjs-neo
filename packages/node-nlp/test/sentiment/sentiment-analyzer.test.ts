import { SentimentAnalyzer } from '../../src/index.js';

describe('Sentiment Analyzer', () => {
  describe('Constructor', () => {
    test('Should create', () => {
      const analyzer = new SentimentAnalyzer();
      expect(analyzer).toBeDefined();
    });
  });

  describe('Get Sentiment', () => {
    test('Get positive sentiment', async () => {
      const analyzer = new SentimentAnalyzer();
      const utterance = 'I love cats, are so cute!';
      const result = await analyzer.getSentiment(utterance);
      expect(result).toBeDefined();
      expect(result.score).toEqual(0.75);
      expect(result.numWords).toEqual(6);
      expect(result.numHits).toEqual(2);
      expect(result.average).toEqual(0.125);
      expect(result.type).toEqual('senticon');
      expect(result.locale).toEqual('en');
    });
    test('Get negative sentiment', async () => {
      const analyzer = new SentimentAnalyzer();
      const utterance = 'I hate cats, are awful!';
      const result = await analyzer.getSentiment(utterance);
      expect(result).toBeDefined();
      expect(result.score).toEqual(-0.75);
      expect(result.numWords).toEqual(5);
      expect(result.numHits).toEqual(1);
      expect(result.average).toEqual(-0.15);
      expect(result.type).toEqual('senticon');
      expect(result.locale).toEqual('en');
    });
  });
});
