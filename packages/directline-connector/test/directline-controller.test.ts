/*
 * Copyright (c) AXA Group Operations Spain S.A.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import http from 'node:http';
import DirectlineController from '../src/directline-controller.js';

type BotCall = {
  method: string | undefined;
  contentType: string | undefined;
  activity: any;
};

let bot: http.Server;
let botUrl: string;
let botCalls: BotCall[];
let botStatus: number;

beforeEach(async () => {
  botCalls = [];
  botStatus = 200;
  bot = http.createServer((req, res) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      botCalls.push({
        method: req.method,
        contentType: req.headers['content-type'],
        activity: JSON.parse(body),
      });
      res.writeHead(botStatus, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    });
  });
  await new Promise<void>((resolve) => bot.listen(0, '127.0.0.1', resolve));
  botUrl = `http://127.0.0.1:${(bot.address() as { port: number }).port}/bot`;
});

afterEach(async () => {
  await new Promise<void>((resolve) => bot.close(() => resolve()));
});

function newController(settings: Record<string, unknown> = {}) {
  return new DirectlineController(
    { container: { name: 'test-app' }, ...settings },
    undefined
  );
}

describe('DirectlineController', () => {
  describe('constructor', () => {
    test('It should default the service URL and the expiration', () => {
      const controller = newController();
      expect(controller.serviceUrl).toEqual('http://localhost:3000');
      expect(controller.expiresIn).toEqual(1800);
      expect(controller.conversations).toEqual({});
    });

    test('Settings should win over the defaults', () => {
      const controller = newController({
        serviceUrl: 'http://example.test',
        expiresIn: 60,
      });
      expect(controller.serviceUrl).toEqual('http://example.test');
      expect(controller.expiresIn).toEqual(60);
    });
  });

  describe('getConversation', () => {
    test('It should not create a conversation unless asked to', () => {
      const controller = newController();
      expect(controller.getConversation('abc')).toBeUndefined();
      expect(controller.getConversation('abc', true).conversationId).toEqual(
        'abc'
      );
      expect(controller.getConversation('abc').history).toEqual([]);
    });
  });

  describe('createConversation', () => {
    test('It should answer 200 without calling a bot when no bot URL is set', async () => {
      const controller = newController();
      const actual: any = await controller.createConversation();
      expect(actual.status).toEqual(200);
      expect(actual.body.conversationId).toBeDefined();
      expect(actual.body.expiresIn).toEqual(1800);
      expect(botCalls).toHaveLength(0);
    });

    test('It should POST a conversationUpdate activity to the bot', async () => {
      const controller = newController({ botUrl });
      const actual: any = await controller.createConversation();
      expect(actual.status).toEqual(200);
      expect(botCalls).toHaveLength(1);
      expect(botCalls[0].method).toEqual('POST');
      expect(botCalls[0].contentType).toEqual('application/json');
      expect(botCalls[0].activity.type).toEqual('conversationUpdate');
      // `createConversationUpdateActivity` reads `conversation.id`, but the
      // stored conversation only carries `conversationId`. Pinned as is; it
      // predates this suite and is not a dependency concern.
      expect(botCalls[0].activity.conversation.id).toBeUndefined();
    });

    test('It should report the status the bot answered with', async () => {
      botStatus = 503;
      const controller = newController({ botUrl });
      const actual: any = await controller.createConversation();
      expect(actual.status).toEqual(503);
    });

    test('It should call the onCreateConversation hook', async () => {
      const controller = newController();
      const seen: any[] = [];
      controller.onCreateConversation = (_parent, result) => {
        seen.push(result);
        result.custom = 'added';
      };
      const actual: any = await controller.createConversation();
      expect(seen).toHaveLength(1);
      expect(actual.body.custom).toEqual('added');
    });
  });

  describe('addActivity', () => {
    test('It should POST the activity to the bot and answer with its id', async () => {
      const controller = newController({ botUrl });
      const actual: any = await controller.addActivity('conv-1', {
        type: 'message',
        text: 'hello',
        from: { id: 'user-1' },
      });
      expect(actual.status).toEqual(200);
      expect(actual.body.id).toBeDefined();
      expect(botCalls).toHaveLength(1);
      expect(botCalls[0].activity.text).toEqual('hello');
      expect(botCalls[0].activity.conversation.id).toEqual('conv-1');
      expect(botCalls[0].activity.channelId).toEqual('emulator');
      expect(controller.getConversation('conv-1').history).toHaveLength(1);
    });

    test('It should ignore typing activities', async () => {
      const controller = newController({ botUrl });
      const actual: any = await controller.addActivity('conv-1', {
        type: 'typing',
      });
      expect(actual).toEqual({ status: 200, body: {} });
      expect(botCalls).toHaveLength(0);
    });

    test('It should call the onHear hook when there is no bot URL', async () => {
      const controller = newController();
      const heard: any[] = [];
      controller.onHear = (_parent, message) => {
        heard.push(message);
        return Promise.resolve();
      };
      const actual: any = await controller.addActivity('conv-1', {
        type: 'message',
        text: 'hello',
      });
      expect(actual.status).toEqual(200);
      expect(heard).toHaveLength(1);
      expect(heard[0].message).toEqual('hello');
      expect(heard[0].channel).toEqual('directline');
      expect(heard[0].app).toEqual('test-app');
    });
  });

  describe('getActivities', () => {
    test('It should return the history from the watermark on', async () => {
      const controller = newController({ botUrl });
      await controller.addActivity('conv-1', { type: 'message', text: 'one' });
      await controller.addActivity('conv-1', { type: 'message', text: 'two' });
      const all: any = await controller.getActivities('conv-1', 0);
      expect(all.body.activities).toHaveLength(2);
      expect(all.body.watermark).toEqual(2);
      const tail: any = await controller.getActivities('conv-1', 1);
      expect(tail.body.activities).toHaveLength(1);
      expect(tail.body.activities[0].text).toEqual('two');
      expect(tail.body.watermark).toEqual(2);
      const empty: any = await controller.getActivities('conv-1', 2);
      expect(empty.body.activities).toEqual([]);
    });
  });

  describe('say and postActivityV3', () => {
    test('say should append to an existing conversation only', () => {
      const controller = newController();
      controller.getConversation('conv-1', true);
      controller.say({ conversation: { id: 'conv-1' }, text: 'hi' });
      expect(controller.getConversation('conv-1').history).toHaveLength(1);
      expect(() =>
        controller.say({ conversation: { id: 'absent' }, text: 'hi' })
      ).not.toThrow();
    });

    test('postActivityV3 should stamp the activity and store it', async () => {
      const controller = newController();
      const actual: any = await controller.postActivityV3('conv-1', {
        type: 'message',
        text: 'hi',
      });
      expect(actual.status).toEqual(200);
      const [stored] = controller.getConversation('conv-1').history;
      expect(stored.id).toBeDefined();
      expect(stored.from).toEqual({ id: 'directline', name: 'Directline' });
    });
  });
});
