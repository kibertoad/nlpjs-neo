import { NlpManager, NlpExcelReader } from '../../src/index.js';

describe('NLP Excel Reader', () => {
  describe('Constructor', () => {
    test('It should create an instance', () => {
      const manager = new NlpManager();
      const reader = new NlpExcelReader(manager);
      expect(reader).toBeDefined();
    });
  });

  describe('Load excel', () => {
    test('It should read languages', async () => {
      const manager = new NlpManager();
      const reader = new NlpExcelReader(manager);
      await reader.load('./packages/node-nlp/test/nlp/rules.xlsx');
      expect(manager.nlp.nluManager.locales).toEqual(['en', 'es']);
    });
    test('It should read excel without regex entities', async () => {
      const manager = new NlpManager();
      const reader = new NlpExcelReader(manager);
      await reader.load('./packages/node-nlp/test/nlp/rulesnoregex.xlsx');
      expect(manager.nlp.nluManager.locales).toEqual(['en', 'es']);
    });
    test('It should read named entities', async () => {
      const manager = new NlpManager();
      const reader = new NlpExcelReader(manager);
      await reader.load('./packages/node-nlp/test/nlp/rules.xlsx');
      expect(manager.nlp.ner.rules.en).toBeDefined();
      expect(manager.nlp.ner.rules.es).toBeDefined();
      expect(manager.nlp.ner.rules.en.hero).toBeDefined();
      expect(manager.nlp.ner.rules.en.food).toBeDefined();
      expect(manager.nlp.ner.rules.es.hero).toBeDefined();
      expect(manager.nlp.ner.rules.es.food).toBeDefined();
    });
    test('It should create the classifiers for the languages', async () => {
      const manager = new NlpManager();
      const reader = new NlpExcelReader(manager);
      await reader.load('./packages/node-nlp/test/nlp/rules.xlsx');
      expect(manager.nlp.nluManager.domainManagers.en).toBeDefined();
      expect(manager.nlp.nluManager.domainManagers.es).toBeDefined();
    });
    test('The classifiers should contain the intent definition', async () => {
      const manager = new NlpManager();
      const reader = new NlpExcelReader(manager);
      await reader.load('./packages/node-nlp/test/nlp/rules.xlsx');
      expect(manager.nlp.nluManager.domainManagers.en.sentences).toHaveLength(
        5
      );
      expect(
        manager.nlp.nluManager.domainManagers.en.sentences[0].intent
      ).toEqual('whois');
      expect(
        manager.nlp.nluManager.domainManagers.en.sentences[1].intent
      ).toEqual('whereis');
      expect(
        manager.nlp.nluManager.domainManagers.en.sentences[2].intent
      ).toEqual('whereis');
      expect(
        manager.nlp.nluManager.domainManagers.en.sentences[3].intent
      ).toEqual('whereis');
      expect(
        manager.nlp.nluManager.domainManagers.en.sentences[4].intent
      ).toEqual('realname');
      expect(manager.nlp.nluManager.domainManagers.es.sentences).toHaveLength(
        4
      );
      expect(
        manager.nlp.nluManager.domainManagers.es.sentences[0].intent
      ).toEqual('whois');
      expect(
        manager.nlp.nluManager.domainManagers.es.sentences[1].intent
      ).toEqual('whereis');
      expect(
        manager.nlp.nluManager.domainManagers.es.sentences[2].intent
      ).toEqual('whereis');
      expect(
        manager.nlp.nluManager.domainManagers.es.sentences[3].intent
      ).toEqual('realname');
    });
    test('The NLG should be filled', async () => {
      const manager = new NlpManager();
      const reader = new NlpExcelReader(manager);
      await reader.load('./packages/node-nlp/test/nlp/rules.xlsx');
      expect(manager.nlp.nlgManager.responses.en).toBeDefined();
      expect(manager.nlp.nlgManager.responses.en.whois).toBeDefined();
      expect(manager.nlp.nlgManager.responses.en.whereis).toBeDefined();
      expect(manager.nlp.nlgManager.responses.en.realname).toBeDefined();
      expect(manager.nlp.nlgManager.responses.es).toBeDefined();
      expect(manager.nlp.nlgManager.responses.es.whois).toBeDefined();
      expect(manager.nlp.nlgManager.responses.es.whereis).toBeDefined();
      expect(manager.nlp.nlgManager.responses.es.realname).toBeDefined();
    });
  });
});
