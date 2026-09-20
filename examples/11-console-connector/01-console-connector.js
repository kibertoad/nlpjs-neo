import { ConsoleConnector } from '../../packages/console-connector/src/index.js';
// import { ConsoleConnector } from '@nlpjs-neo/console-connector';

const connector = new ConsoleConnector();
connector.onHear = (self, text) => {
  self.say(`You said "${text}"`);
};
connector.say('Say something!');
