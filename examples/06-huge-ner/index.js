import { dock } from '../../packages/core-loader/src/index.js';
import airports from './airports.json' with { type: 'json' };

(async () => {
  await dock.start();
  const container = dock.getContainer();
  const nlp = container.get('nlp');
  const airportKeys = Object.keys(airports);
  for (let i = 0; i < airportKeys.length; i += 1) {
    const airport = airports[airportKeys[i]];
    nlp.addNerRuleOptionTexts('en', 'airport', airport.icao, airport.city);
  }
  let answer = await nlp.process('I want to flight from Albacete');
  console.log(answer.entities);
  answer = await nlp.process('I want to flight from Madrid to Las Vegas');
  console.log(answer.entities);
  console.time('algo');
  const entities = await nlp.extractEntities(
    'I want to flight from Barcelona to Paris'
  );
  console.timeEnd('algo');
  console.log(entities);
})();
