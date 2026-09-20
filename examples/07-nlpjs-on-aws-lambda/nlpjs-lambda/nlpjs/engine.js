import { existsSync } from 'node:fs';

import { NlpManager } from 'node-nlp-neo';

const LANGUAGE = 'en';
const DEFAULT_PHRASE = 'Hi';

// Lambda gives every execution environment its own writable /tmp, so a model
// trained by one invocation is reused by the next one on the same container.
const MODEL_PATH = '/tmp/model.nlp';

function addCorpus(manager) {
  // Adds the utterances and intents for the NLP
  manager.addDocument(LANGUAGE, 'goodbye for now', 'greetings.bye');
  manager.addDocument(LANGUAGE, 'bye bye take care', 'greetings.bye');
  manager.addDocument(LANGUAGE, 'okay see you later', 'greetings.bye');
  manager.addDocument(LANGUAGE, 'bye for now', 'greetings.bye');
  manager.addDocument(LANGUAGE, 'i must go', 'greetings.bye');
  manager.addDocument(LANGUAGE, 'hello', 'greetings.hello');
  manager.addDocument(LANGUAGE, DEFAULT_PHRASE, 'greetings.hello');
  manager.addDocument(LANGUAGE, 'howdy', 'greetings.hello');

  // Train also the NLG
  manager.addAnswer(LANGUAGE, 'greetings.bye', 'Till next time');
  manager.addAnswer(LANGUAGE, 'greetings.bye', 'see you soon!');
  manager.addAnswer(LANGUAGE, 'greetings.hello', 'Hey there!');
  manager.addAnswer(LANGUAGE, 'greetings.hello', 'Greetings!');
}

async function buildManager() {
  const manager = new NlpManager({
    languages: [LANGUAGE],
    autoSave: false,
    autoLoad: false,
  });

  if (existsSync(MODEL_PATH)) {
    console.info('LOADING THE MODEL FROM', MODEL_PATH);
    manager.load(MODEL_PATH);
    return manager;
  }

  console.info('TRAINING A NEW MODEL');
  addCorpus(manager);
  await manager.train();
  manager.save(MODEL_PATH);
  return manager;
}

// Kept as a promise rather than awaited at module scope: the first invocation
// waits for the training, every later one on the same container gets the
// already resolved promise.
let managerPromise;

export const engine = {
  defaultPhrase: DEFAULT_PHRASE,
  async process(phrase) {
    managerPromise ??= buildManager();
    const manager = await managerPromise;
    return manager.process(LANGUAGE, phrase);
  },
};
