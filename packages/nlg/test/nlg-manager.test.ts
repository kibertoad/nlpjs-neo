import { Container, containerBootstrap } from '@nlpjs-neo/core';
import { NlgManager } from '../src/index.js';
import type { NlgInput } from '../src/index.js';
import container from './bootstrap.js';

class Evaluator {
  evaluate(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
  }
}

class JsonTemplate {
  compile(obj: unknown, context: Record<string, string>) {
    return JSON.parse(
      JSON.stringify(obj).replace(/{{ ?name ?}}/g, context.name)
    );
  }
}

describe('NLG Manager', () => {
  describe('constructor', () => {
    test('Should create an instance', () => {
      const manager = new NlgManager({ container });
      expect(manager).toBeDefined();
    });
    test('Should initialize properties', () => {
      const manager = new NlgManager({ container });
      expect(manager.settings.tag).toEqual('nlg-manager');
      expect(manager.responses).toEqual({});
    });
  });

  describe('Choose Random', () => {
    test('It should do nothing if answers is not defined', () => {
      const manager = new NlgManager({ container });
      const input: NlgInput = {};
      manager.chooseRandom(input);
      expect(input.answer).toBeUndefined();
    });
    test('It should do nothing if answers is empty', () => {
      const manager = new NlgManager({ container });
      const input: NlgInput = { answers: [] };
      manager.chooseRandom(input);
      expect(input.answer).toBeUndefined();
    });
    test('If there is only one answer, return this answer', () => {
      const manager = new NlgManager({ container });
      const input: NlgInput = { answers: [{ answer: 'a' }] };
      manager.chooseRandom(input);
      expect(input.answer).toEqual('a');
    });
    test('If there is more than one should return at random', () => {
      const manager = new NlgManager({ container });
      const input = { answers: [{ answer: 'a' }, { answer: 'b' }] };
      const responses: Record<string, number> = {};
      for (let i = 0; i < 100; i += 1) {
        responses[manager.chooseRandom(input).answer as string] = 1;
      }
      expect(responses).toEqual({ a: 1, b: 1 });
    });
  });

  describe('Structured answers', () => {
    const card = { type: 'card', title: 'Hello {{ name }}' };
    test('Choose Random should pick one of the structured answers', () => {
      const manager = new NlgManager({ container });
      const other = { type: 'card', title: 'Bye' };
      const input = { answers: [{ answer: card }, { answer: other }] };
      const seen = new Set<unknown>();
      for (let i = 0; i < 100; i += 1) {
        seen.add(manager.chooseRandom(input).answer);
      }
      expect(seen).toEqual(new Set([card, other]));
    });
    test('Should add a structured answer and not duplicate it', () => {
      const manager = new NlgManager({ container });
      manager.add('en', 'greet', card);
      manager.add('en', 'greet', { ...card });
      expect(manager.responses.en.greet).toHaveLength(1);
      expect(manager.responses.en.greet[0].answer).toEqual(card);
    });
    test('Should remove a structured answer', () => {
      const manager = new NlgManager({ container });
      manager.add('en', 'greet', card);
      manager.remove('en', 'greet', { ...card });
      expect(manager.responses.en.greet).toHaveLength(0);
    });
    test('Render should apply the templates to the structured data only', () => {
      const own = containerBootstrap();
      own.register('Template', JsonTemplate, true);
      const manager = new NlgManager({ container: own });
      const rendered = manager.renderText({ answer: card }, { name: 'John' });
      expect(rendered.answer).toEqual({ type: 'card', title: 'Hello John' });
    });
    test('Render should leave a text with alternatives to be resolved', () => {
      const manager = new NlgManager({ container });
      expect(manager.renderText('(a|a)')).toEqual('a');
    });
    test('Should not duplicate an answer whose keys are in another order', () => {
      const manager = new NlgManager({ container });
      manager.add('en', 'greet', { type: 'card', title: 'Hello' });
      manager.add('en', 'greet', { title: 'Hello', type: 'card' });
      expect(manager.responses.en.greet).toHaveLength(1);
    });
    test('Should remove an answer whose keys are in another order', () => {
      const manager = new NlgManager({ container });
      manager.add('en', 'greet', { type: 'card', title: 'Hello' });
      manager.remove('en', 'greet', { title: 'Hello', type: 'card' });
      expect(manager.responses.en.greet).toHaveLength(0);
    });
    test('Should compare an answer that refers back to itself', () => {
      const manager = new NlgManager({ container });
      const stored: Record<string, unknown> = { type: 'card' };
      stored.self = stored;
      expect(() => manager.add('en', 'greet', stored)).not.toThrow();
      const same: Record<string, unknown> = { type: 'card' };
      same.self = same;
      expect(manager.indexOfAnswer('en', 'greet', same)).toEqual(0);
    });
    test('Should not duplicate an answer whose options are in another order', () => {
      const manager = new NlgManager({ container });
      manager.add('en', 'greet', 'Hello', { condition: 'a === 1', tag: 'x' });
      manager.add('en', 'greet', 'Hello', { tag: 'x', condition: 'a === 1' });
      expect(manager.responses.en.greet).toHaveLength(1);
    });
  });

  describe('Answer ownership', () => {
    test('Should not let the object an answer was declared with rewrite it', () => {
      const manager = new NlgManager({ container });
      const declared = { type: 'card', title: 'Hello' };
      manager.add('en', 'greet', declared);
      declared.title = 'Rewritten';
      expect(manager.responses.en.greet[0].answer).toEqual({
        type: 'card',
        title: 'Hello',
      });
    });
    test('Should hand out answers the corpus does not share', () => {
      const manager = new NlgManager({ container });
      const card = { type: 'card', title: 'Hello' };
      manager.add('en', 'greet', card);
      const found = manager.findAllAnswers({
        locale: 'en',
        intent: 'greet',
      }) as NlgInput;
      expect(found.answers[0].answer).toEqual(card);
      expect(found.answers[0]).not.toBe(manager.responses.en.greet[0]);
      (found.answers[0].answer as Record<string, unknown>).title = 'Rewritten';
      expect(manager.responses.en.greet[0].answer).toEqual(card);
    });
    test('Should not let the options an answer was declared with rewrite it', () => {
      const manager = new NlgManager({ container });
      const opts = { condition: 'a === 1', tag: 'x' };
      manager.add('en', 'greet', 'Hello', opts);
      opts.tag = 'rewritten';
      const found = manager.findAllAnswers({
        locale: 'en',
        intent: 'greet',
      }) as NlgInput;
      expect(found.answers[0].opts).toEqual({ condition: 'a === 1', tag: 'x' });
      (found.answers[0].opts as Record<string, unknown>).tag = 'rewritten too';
      expect(manager.responses.en.greet[0].opts).toEqual({
        condition: 'a === 1',
        tag: 'x',
      });
    });
    test('Should give each request its own copy of a structured answer', () => {
      const manager = new NlgManager({ container });
      manager.add('en', 'greet', { type: 'card' });
      const first = manager.findAllAnswers({
        locale: 'en',
        intent: 'greet',
      }) as NlgInput;
      const second = manager.findAllAnswers({
        locale: 'en',
        intent: 'greet',
      }) as NlgInput;
      expect(first.answers[0].answer).not.toBe(second.answers[0].answer);
    });
    test('Render should answer a new value rather than write to the given one', () => {
      const own = containerBootstrap();
      own.register('Template', JsonTemplate, true);
      const manager = new NlgManager({ container: own });
      const source = { answer: { type: 'card', title: 'Hello {{ name }}' } };
      const rendered = manager.renderText(source, { name: 'John' });
      expect(rendered.answer).toEqual({ type: 'card', title: 'Hello John' });
      expect(source.answer).toEqual({
        type: 'card',
        title: 'Hello {{ name }}',
      });
    });
    test('Render should not resolve the alternatives of a stored answer once and for all', () => {
      const manager = new NlgManager({ container });
      manager.add('en', 'greet', '(Hi|Hello) user');
      const found = manager.renderRandom(
        manager.findAllAnswers({ locale: 'en', intent: 'greet' }) as NlgInput
      );
      expect(['Hi user', 'Hello user']).toContain(found.answers[0].answer);
      expect(manager.responses.en.greet[0].answer).toEqual('(Hi|Hello) user');
    });
  });

  describe('Add', () => {
    test('Should add an answer with no condition', () => {
      const manager = new NlgManager({ container });
      manager.add('en', 'greet', 'Hello');
      expect(manager.responses.en.greet).toHaveLength(1);
      expect(manager.responses.en.greet[0].answer).toEqual('Hello');
      // The condition lives under `opts`; nothing is stored beside it.
      expect(
        (manager.responses.en.greet[0] as { condition?: unknown }).condition
      ).toBeUndefined();
    });
    test('Should add an answer with condition', () => {
      const manager = new NlgManager({ container });
      manager.add('en', 'greet', 'Hello', { condition: 'a === 1' });
      expect(manager.responses.en.greet).toHaveLength(1);
      expect(manager.responses.en.greet[0].answer).toEqual('Hello');
      expect(manager.responses.en.greet[0].opts).toEqual({
        condition: 'a === 1',
      });
    });
    test('Should not add a duplicate entry', () => {
      const manager = new NlgManager({ container });
      manager.add('en', 'greet', 'Hello', { condition: 'a === 1' });
      manager.add('en', 'greet', 'Hello', { condition: 'a === 1' });
      expect(manager.responses.en.greet).toHaveLength(1);
    });
    test('Should be able to create several responses for the same intent and locale', () => {
      const manager = new NlgManager({ container });
      manager.add('en', 'greet', 'Hello', { condition: 'a === 1' });
      manager.add('en', 'greet', 'Greetings', { condition: 'a === 1' });
      manager.add('en', 'greet', 'Hi', { condition: 'a === 1' });
      expect(manager.responses.en.greet).toHaveLength(3);
    });
    test('Should be able to create responses for different intents of a locale', () => {
      const manager = new NlgManager({ container });
      manager.add('en', 'greet', 'Hello', { condition: 'a === 1' });
      manager.add('en', 'greet', 'Greetings', { condition: 'a === 1' });
      manager.add('en', 'greet', 'Hi', { condition: 'a === 1' });
      manager.add('en', 'bye', 'Goodbye', { condition: 'a === 1' });
      manager.add('en', 'bye', 'Bye', { condition: 'a === 1' });
      expect(manager.responses.en.greet).toHaveLength(3);
      expect(manager.responses.en.bye).toHaveLength(2);
    });
    test('Should be able to create responses for different intents and locales', () => {
      const manager = new NlgManager();
      manager.add('en', 'greet', 'Hello', { condition: 'a === 1' });
      manager.add('en', 'greet', 'Greetings', { condition: 'a === 1' });
      manager.add('en', 'greet', 'Hi', { condition: 'a === 1' });
      manager.add('en', 'bye', 'Goodbye', { condition: 'a === 1' });
      manager.add('en', 'bye', 'Bye', { condition: 'a === 1' });
      manager.add('es', 'greet', 'Hola', { condition: 'a === 1' });
      manager.add('es', 'greet', 'Holi!', { condition: 'a === 1' });
      manager.add('es', 'bye', 'Hasta luego', { condition: 'a === 1' });
      manager.add('es', 'bye', 'Hasta otra', { condition: 'a === 1' });
      manager.add('es', 'bye', 'Nos vemos!', { condition: 'a === 1' });
      expect(manager.responses.en.greet).toHaveLength(3);
      expect(manager.responses.en.bye).toHaveLength(2);
      expect(manager.responses.es.greet).toHaveLength(2);
      expect(manager.responses.es.bye).toHaveLength(3);
    });
  });

  describe('Remove', () => {
    test('I can remove an added response', () => {
      const manager = new NlgManager({ container });
      manager.add('en', 'greet', 'Hello', { condition: 'a === 1' });
      manager.add('en', 'greet', 'Greetings', { condition: 'a === 1' });
      manager.add('en', 'greet', 'Hi', { condition: 'a === 1' });
      manager.add('en', 'bye', 'Goodbye', { condition: 'a === 1' });
      manager.add('en', 'bye', 'Bye', { condition: 'a === 1' });
      manager.add('es', 'greet', 'Hola', { condition: 'a === 1' });
      manager.add('es', 'greet', 'Holi!', { condition: 'a === 1' });
      manager.add('es', 'bye', 'Hasta luego', { condition: 'a === 1' });
      manager.add('es', 'bye', 'Hasta otra', { condition: 'a === 1' });
      manager.add('es', 'bye', 'Nos vemos!', { condition: 'a === 1' });
      manager.remove('es', 'greet', 'Holi!', { condition: 'a === 1' });
      expect(manager.responses.en.greet).toHaveLength(3);
      expect(manager.responses.en.bye).toHaveLength(2);
      expect(manager.responses.es.greet).toHaveLength(1);
      expect(manager.responses.es.bye).toHaveLength(3);
    });
    test('If the answer does not exists, do nothing', () => {
      const manager = new NlgManager({ container });
      manager.add('en', 'greet', 'Hello', { condition: 'a === 1' });
      manager.remove('en', 'greet', 'Hell', { condition: 'a === 1' });
      expect(manager.responses.en.greet).toHaveLength(1);
    });
  });

  describe('Find all answers', () => {
    test('It should return all answers from intent and locale with no condition', () => {
      const manager = new NlgManager({ container });
      manager.add('en', 'greet', 'Hello');
      manager.add('en', 'greet', 'Greetings');
      manager.add('en', 'greet', 'Hi');
      const result = manager.findAllAnswers({
        locale: 'en',
        intent: 'greet',
      }) as NlgInput;
      expect(result.answers).toHaveLength(3);
    });
    test('It should return an empty array if location does not have answers', () => {
      const manager = new NlgManager({ container });
      manager.add('en', 'greet', 'Hello');
      const result = manager.findAllAnswers({
        locale: 'es',
        intent: 'greet',
      }) as NlgInput;
      expect(result.answers).toHaveLength(0);
    });
    test('It should return an empty array if intent does not exists', () => {
      const manager = new NlgManager({ container });
      manager.add('en', 'greet', 'Hello');
      const result = manager.findAllAnswers({
        locale: 'en',
        intent: 'bye',
      }) as NlgInput;
      expect(result.answers).toHaveLength(0);
    });
  });

  describe('Filter answers', () => {
    test('If answers is undefined do nothing', () => {
      const manager = new NlgManager({ container });
      const input: NlgInput = {};
      manager.filterAnswers(input);
      expect(input.answers).toBeUndefined();
    });
    test('If answers is empty do nothing', () => {
      const manager = new NlgManager({ container });
      const input = { answers: [] };
      manager.filterAnswers(input);
      expect(input.answers).toEqual([]);
    });
    test('If no evaluator do nothing', () => {
      const manager = new NlgManager({ container });
      manager.add('en', 'intent', 'a1', { condition: { a: 1 } });
      manager.add('en', 'intent', 'a2', { condition: { a: 2 } });
      manager.add('en', 'intent', 'a3', { condition: { a: 3 } });
      const input = manager.findAllAnswers({
        locale: 'en',
        intent: 'intent',
      }) as NlgInput;
      manager.filterAnswers(input);
      expect(input.answers).toHaveLength(3);
    });
    test('An evaluator can be used', () => {
      const otherContainer = new Container();
      otherContainer.register('Evaluator', Evaluator, true);
      const manager = new NlgManager({ container: otherContainer });
      manager.add('en', 'intent', 'a1', { condition: { a: 1 } });
      manager.add('en', 'intent', 'a2', { condition: { a: 2 } });
      manager.add('en', 'intent', 'a3', { condition: { a: 3 } });
      const input = manager.findAllAnswers({
        locale: 'en',
        intent: 'intent',
        context: { a: 2 },
      }) as NlgInput;
      manager.filterAnswers(input);
      expect(input.answers).toHaveLength(1);
    });
  });

  describe('Render patterns', () => {
    test('It should render patterns in answer', async () => {
      const manager = new NlgManager();
      manager.add('en', 'intent', '(Hi|Hello) user');
      const actual = await manager.run({ locale: 'en', intent: 'intent' });
      expect(
        ['Hi user', 'Hello user'].includes(actual.answer as string)
      ).toBeTruthy();
    });
  });
});
