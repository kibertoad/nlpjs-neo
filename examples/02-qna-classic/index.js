import { ConsoleConnector } from '../../packages/console-connector/src/index.js';
import { Nlp } from '../../packages/nlp/src/index.js';
import { LangEn } from '../../packages/lang-en/src/index.js';
import { fs } from '../../packages/request/src/index.js';
import trainnlp from './train-nlp.js';

const nlp = new Nlp({ languages: ['en'], threshold: 0.5 });
nlp.container.register('fs', fs);
nlp.use(LangEn);

const connector = new ConsoleConnector();
connector.onHear = async (parent, line) => {
  if (line.toLowerCase() === 'quit') {
    connector.destroy();
    process.exit();
  } else {
    const result = await nlp.process(line);
    connector.say(result.answer);
  }
};

(async () => {
  await trainnlp(nlp);
  connector.say('Say something!');
})();
