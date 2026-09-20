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
import { request, fs as webFs } from '../src/index.js';

type ReceivedRequest = {
  method: string | undefined;
  url: string | undefined;
  headers: http.IncomingHttpHeaders;
  body: string;
};

const proxyEnvVars = ['http_proxy', 'https_proxy', 'HTTP_PROXY', 'HTTPS_PROXY'];

let server: http.Server;
let baseUrl: string;
let received: ReceivedRequest[];
let savedProxyEnv: Record<string, string | undefined>;

function readBody(req: http.IncomingMessage) {
  return new Promise<string>((resolve) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => resolve(body));
  });
}

async function handle(req: http.IncomingMessage, res: http.ServerResponse) {
  const body = await readBody(req);
  received.push({
    method: req.method,
    url: req.url,
    headers: req.headers,
    body,
  });
  const requestPath = new URL(req.url ?? '/', 'http://localhost').pathname;
  if (requestPath === '/text') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('not json at all');
    return;
  }
  if (requestPath === '/missing') {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('nope');
    return;
  }
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ method: req.method, url: req.url, body }));
}

beforeEach(async () => {
  savedProxyEnv = Object.fromEntries(
    proxyEnvVars.map((name) => [name, process.env[name]])
  );
  for (const name of proxyEnvVars) {
    delete process.env[name];
  }
  received = [];
  server = http.createServer((req, res) => {
    void handle(req, res);
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
});

afterEach(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
  for (const [name, value] of Object.entries(savedProxyEnv)) {
    if (value === undefined) {
      delete process.env[name];
    } else {
      process.env[name] = value;
    }
  }
});

describe('Request RN', () => {
  describe('request', () => {
    test('It should accept a plain URL string and default to GET', async () => {
      const actual: any = await request(`${baseUrl}/hello`);
      expect(actual.method).toEqual('GET');
      expect(actual.url).toEqual('/hello');
    });

    test('It should return parsed JSON', async () => {
      const actual: any = await request({ url: `${baseUrl}/hello` });
      expect(actual).toEqual({ method: 'GET', url: '/hello', body: '' });
    });

    test('It should return the raw text when the answer is not JSON', async () => {
      const actual = await request(`${baseUrl}/text`);
      expect(actual).toEqual('not json at all');
    });

    test('It should send a JSON body for the `data` option', async () => {
      const actual: any = await request({
        url: `${baseUrl}/submit`,
        method: 'post',
        data: { name: 'Anna' },
      });
      expect(actual.method).toEqual('POST');
      expect(received.at(-1)?.body).toEqual('{"name":"Anna"}');
      expect(received.at(-1)?.headers['content-type']).toMatch(
        /application\/json/
      );
    });

    test('It should append the `params` option as a query string', async () => {
      await request({
        url: `${baseUrl}/search`,
        params: { q: 'hello world', page: 2 },
      });
      expect(received.at(-1)?.url).toEqual('/search?q=hello+world&page=2');
    });

    test('It should forward custom headers', async () => {
      await request({
        url: `${baseUrl}/hello`,
        headers: { 'x-custom': 'value' },
      });
      expect(received.at(-1)?.headers['x-custom']).toEqual('value');
    });

    test('It should reject on an error status', async () => {
      await expect(request(`${baseUrl}/missing`)).rejects.toThrow(/404/);
    });
  });

  describe('fs', () => {
    test('readFile should fetch a web URL', async () => {
      const actual: any = await webFs.readFile(`${baseUrl}/hello`);
      expect(actual.url).toEqual('/hello');
    });

    test('readFile should resolve undefined for a local path', async () => {
      expect(await webFs.readFile('./some/local/path.json')).toBeUndefined();
    });

    test('readFile should resolve undefined when the request fails', async () => {
      expect(await webFs.readFile(`${baseUrl}/missing`)).toBeUndefined();
    });

    test('writeFile should reject', async () => {
      await expect(webFs.writeFile()).rejects.toThrow(
        'File cannot be written in web'
      );
    });

    test('The synchronous helpers should report an empty file system', () => {
      expect(webFs.existsSync()).toEqual(false);
      expect(webFs.lstatSync()).toBeUndefined();
      expect(webFs.readFileSync()).toBeUndefined();
      expect(webFs.name).toEqual('fs');
    });
  });
});
