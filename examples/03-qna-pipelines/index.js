import { containerBootstrap } from '../../packages/core-loader/src/index.js';

(async () => {
  const container = containerBootstrap();
  await container.start();
  const nlp = container.get('nlp');
  const result = await nlp.process('who are you');
  console.log(result);
})();
