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

import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { containerBootstrap } from '@nlpjs-neo/core';
import { DirectlineConnector } from '../src/index.js';

type Handler = (req: any, res: any) => unknown;

/**
 * The connector registers its routes on `container.get('api-server').app`.
 * This records them so a test can drive one with a real `IncomingMessage`,
 * without pulling Express into this package.
 */
class RouterMock {
  routes = new Map<string, Handler>();

  private register(method: string) {
    return (route: string, handler: Handler) => {
      this.routes.set(`${method} ${route}`, handler);
    };
  }

  get = this.register('get');
  post = this.register('post');
  options = this.register('options');
  delete = this.register('delete');

  handlerFor(key: string) {
    const handler = this.routes.get(key);
    if (!handler) {
      throw new Error(`No handler registered for ${key}`);
    }
    return handler;
  }
}

const uploadRoute = 'post /directline/conversations/:conversationId/upload';

let uploadDir: string;
let router: RouterMock;
let connector: any;
let server: http.Server;
let baseUrl: string;

/** Bridges the recorded Express-style handler onto a real HTTP server. */
function serveRoute(key: string, params: Record<string, string>) {
  const handler = router.handlerFor(key);
  server = http.createServer((req, res) => {
    let statusCode = 200;
    const shim = {
      status(code: number) {
        statusCode = code;
        return this;
      },
      send(body: unknown) {
        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(typeof body === 'string' ? body : JSON.stringify(body));
      },
      end() {
        res.writeHead(statusCode).end();
      },
    };
    Object.assign(req, { params });
    void handler(req, shim);
  });
  return new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      baseUrl = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
      resolve();
    });
  });
}

function bootstrap(settings: Record<string, unknown> = {}) {
  const container = containerBootstrap();
  router = new RouterMock();
  container.register('api-server', { app: router });
  container.register('logger', {
    debug() {},
    info() {},
    trace() {},
    error() {},
  });
  connector = new DirectlineConnector({
    container,
    uploadDir,
    log: false,
    ...settings,
  });
  connector.start();
  return connector;
}

function uploadBody(activity: unknown, fileContents: string) {
  const form = new FormData();
  form.append(
    'activity',
    new Blob([JSON.stringify(activity)], { type: 'application/json' }),
    'activity.json'
  );
  form.append('file', new Blob([fileContents]), 'photo.txt');
  return form;
}

beforeEach(() => {
  uploadDir = fs.mkdtempSync(path.join(os.tmpdir(), 'directline-uploads-'));
});

afterEach(async () => {
  if (server?.listening) {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
  fs.rmSync(uploadDir, { recursive: true, force: true });
});

describe('DirectlineConnector', () => {
  describe('start', () => {
    test('It should fail without an api-server', () => {
      const container = containerBootstrap();
      container.register('api-server', {});
      const failing = new DirectlineConnector({ container, log: false });
      expect(() => failing.start()).toThrow('No api-server found');
    });

    test('It should register the directline routes', () => {
      bootstrap();
      expect([...router.routes.keys()]).toContain(
        'post /directline/conversations'
      );
      expect([...router.routes.keys()]).toContain(uploadRoute);
    });

    test('It should default the upload settings', () => {
      const created = new DirectlineConnector({
        container: containerBootstrap(),
        log: false,
      });
      expect(created.settings.autoRemoveFiles).toEqual(true);
      expect(created.settings.uploadDir).toEqual('./uploads/');
      expect(created.settings.maxFileSize).toEqual(8000000);
    });
  });

  describe('upload', () => {
    test('It should store the uploaded activity and answer with its id', async () => {
      const heard: any[] = [];
      bootstrap();
      connector.controller.onHear = (_parent, message) => {
        heard.push(message);
        return Promise.resolve();
      };
      await serveRoute(uploadRoute, { conversationId: 'conv-1' });

      const response = await fetch(baseUrl, {
        method: 'POST',
        body: uploadBody({ type: 'message', text: 'here it is' }, 'the bytes'),
      });

      expect(response.status).toEqual(200);
      expect((await response.json()).id).toBeDefined();
      expect(heard).toHaveLength(1);
      expect(heard[0].message).toEqual('here it is');
      expect(heard[0].activity.file.originalFilename).toEqual('photo.txt');
    });

    test('It should remove the temporary files by default', async () => {
      bootstrap();
      connector.controller.onHear = () => Promise.resolve();
      await serveRoute(uploadRoute, { conversationId: 'conv-1' });

      await fetch(baseUrl, {
        method: 'POST',
        body: uploadBody({ type: 'message', text: 'hello' }, 'the bytes'),
      });

      expect(fs.readdirSync(uploadDir)).toEqual([]);
    });

    test('It should keep the temporary files when asked to', async () => {
      bootstrap({ autoRemoveFiles: false });
      connector.controller.onHear = () => Promise.resolve();
      await serveRoute(uploadRoute, { conversationId: 'conv-1' });

      await fetch(baseUrl, {
        method: 'POST',
        body: uploadBody({ type: 'message', text: 'hello' }, 'the bytes'),
      });

      expect(fs.readdirSync(uploadDir)).toHaveLength(2);
    });

    test('It should answer 500 when the activity is not valid JSON', async () => {
      bootstrap();
      connector.controller.onHear = () => Promise.resolve();
      await serveRoute(uploadRoute, { conversationId: 'conv-1' });

      const form = new FormData();
      form.append('activity', new Blob(['not json']), 'activity.json');
      form.append('file', new Blob(['the bytes']), 'photo.txt');
      const response = await fetch(baseUrl, { method: 'POST', body: form });

      expect(response.status).toEqual(500);
      expect(await response.text()).toEqual(
        'There was an error processing the message'
      );
      expect(fs.readdirSync(uploadDir)).toEqual([]);
    });

    test('It should answer 500 when no activity is uploaded', async () => {
      bootstrap();
      connector.controller.onHear = () => Promise.resolve();
      await serveRoute(uploadRoute, { conversationId: 'conv-1' });

      const form = new FormData();
      form.append('file', new Blob(['the bytes']), 'photo.txt');
      const response = await fetch(baseUrl, { method: 'POST', body: form });

      expect(response.status).toEqual(500);
    });
  });
});
