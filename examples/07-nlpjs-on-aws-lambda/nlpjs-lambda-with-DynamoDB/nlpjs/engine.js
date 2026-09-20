import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';

import { NlpManager } from 'node-nlp-neo';

const LANGUAGE = 'en';
const DEFAULT_PHRASE = 'Hi';

// The table is created by the SAM template; the model is a single row in it, so
// every container of the function shares one trained model.
const { MODEL_TABLENAME } = process.env;
const MODEL_KEY = 'themodel';

// Under `sam local` the table lives in a DynamoDB container started next to the
// function, which the deployed client would not find.
const isLocal = process.env.AWS_SAM_LOCAL === 'true';
const localOptions = {
  endpoint: 'http://host.docker.internal:8000/',
  region: 'eu-west-1',
};

const documentClient = DynamoDBDocumentClient.from(
  new DynamoDBClient(isLocal ? localOptions : {})
);

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

// A model that cannot be read or written is not fatal: it is cheap enough to
// train again, the work just is not shared with the next container.
async function readStoredModel() {
  try {
    const { Item } = await documentClient.send(
      new GetCommand({
        TableName: MODEL_TABLENAME,
        Key: { id: MODEL_KEY },
      })
    );
    return Item?.model;
  } catch (err) {
    console.warn('COULD NOT READ THE STORED MODEL:', err);
    return undefined;
  }
}

async function storeModel(model) {
  try {
    await documentClient.send(
      new PutCommand({
        TableName: MODEL_TABLENAME,
        Item: { id: MODEL_KEY, model },
      })
    );
    console.info('MODEL STORED IN', MODEL_TABLENAME);
  } catch (err) {
    console.warn('COULD NOT STORE THE TRAINED MODEL:', err);
  }
}

async function buildManager() {
  const manager = new NlpManager({
    languages: [LANGUAGE],
    autoSave: false,
    autoLoad: false,
  });

  const storedModel = await readStoredModel();
  if (storedModel) {
    console.info('LOADING THE MODEL FROM', MODEL_TABLENAME);
    manager.import(storedModel);
    return manager;
  }

  console.info('TRAINING A NEW MODEL');
  addCorpus(manager);
  await manager.train();
  await storeModel(manager.export());
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
