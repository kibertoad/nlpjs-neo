import { SentimentManager } from '../../src/index.js';

describe('Sentiment Manager', () => {
  describe('Constructor', () => {
    test('Should create', () => {
      const sentiment = new SentimentManager();
      expect(sentiment).toBeDefined();
    });
  });

  describe('Process', () => {
    test('Get positive sentiment', async () => {
      const sentiment = new SentimentManager();
      const utterance = 'I love cats, are so cute!';
      const result = await sentiment.process('en', utterance);
      expect(result).toBeDefined();
      expect(result.score).toEqual(0.75);
      expect(result.numWords).toEqual(6);
      expect(result.numHits).toEqual(2);
      expect(result.comparative).toEqual(0.125);
      expect(result.type).toEqual('senticon');
      expect(result.language).toEqual('en');
      expect(result.vote).toEqual('positive');
    });
    test('Get negative sentiment', async () => {
      const sentiment = new SentimentManager();
      const utterance = 'I hate cats, are awful!';
      const result = await sentiment.process('en', utterance);
      expect(result).toBeDefined();
      expect(result.score).toEqual(-0.75);
      expect(result.numWords).toEqual(5);
      expect(result.numHits).toEqual(1);
      expect(result.comparative).toEqual(-0.15);
      expect(result.type).toEqual('senticon');
      expect(result.language).toEqual('en');
      expect(result.vote).toEqual('negative');
    });
    test('Get positive sentiment bengali', async () => {
      const sentiment = new SentimentManager();
      const utterance = 'আমি বিড়াল ভালবাসি, খুব সুন্দর';
      const result = await sentiment.process('bn', utterance);
      expect(result).toBeDefined();
      expect(result.score).toEqual(5.5);
      expect(result.numWords).toEqual(5);
      expect(result.numHits).toEqual(2);
      expect(result.comparative).toEqual(1.1);
      expect(result.type).toEqual('afinn');
      expect(result.language).toEqual('bn');
      expect(result.vote).toEqual('positive');
    });
    test('Get negative sentiment bengali', async () => {
      const sentiment = new SentimentManager();
      const utterance = 'আমি বিড়ালদের ঘৃণা করি, ভয়াবহ';
      const result = await sentiment.process('bn', utterance);
      expect(result).toBeDefined();
      expect(result.score).toEqual(-2);
      expect(result.numWords).toEqual(5);
      expect(result.numHits).toEqual(1);
      expect(result.comparative).toEqual(-0.4);
      expect(result.type).toEqual('afinn');
      expect(result.language).toEqual('bn');
      expect(result.vote).toEqual('negative');
    });
    test('Get positive sentiment deutsch', async () => {
      const sentiment = new SentimentManager();
      const utterance = 'Ich liebe Kätzchen';
      const result = await sentiment.process('de', utterance);
      expect(result).toBeDefined();
      expect(result.score).toBeGreaterThan(0);
      expect(result.numWords).toEqual(3);
      expect(result.numHits).toEqual(1);
      expect(result.type).toEqual('senticon');
      expect(result.language).toEqual('de');
      expect(result.vote).toEqual('positive');
    });
    test('Get negative sentiment deutsch', async () => {
      const sentiment = new SentimentManager();
      const utterance = 'Ich hasse Katzen, ich werde wirklich krank.';
      const result = await sentiment.process('de', utterance);
      expect(result).toBeDefined();
      expect(result.score).toBeLessThan(0);
      expect(result.numWords).toEqual(7);
      expect(result.numHits).toEqual(2);
      expect(result.type).toEqual('senticon');
      expect(result.language).toEqual('de');
      expect(result.vote).toEqual('negative');
    });
  });
});
