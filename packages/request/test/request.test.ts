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
import { request } from '../src/index.js';

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

/** Echoes the request back as JSON, or as plain text under `/text`. */
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
  if (requestPath === '/error') {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'boom' }));
    return;
  }
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ method: req.method, url: req.url, body }));
}

function listen(srv: http.Server) {
  return new Promise<number>((resolve) => {
    srv.listen(0, '127.0.0.1', () =>
      resolve((srv.address() as { port: number }).port)
    );
  });
}

function close(srv: http.Server) {
  return new Promise<void>((resolve) => srv.close(() => resolve()));
}

beforeEach(async () => {
  // `request` falls back to the ambient proxy configuration; clear it so the
  // suite behaves the same on a developer machine and behind a corporate proxy.
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
  baseUrl = `http://127.0.0.1:${await listen(server)}`;
});

afterEach(async () => {
  await close(server);
  for (const [name, value] of Object.entries(savedProxyEnv)) {
    if (value === undefined) {
      delete process.env[name];
    } else {
      process.env[name] = value;
    }
  }
});

describe('Request', () => {
  describe('GET', () => {
    test('It should accept a plain URL string and parse a JSON answer', async () => {
      const actual: any = await request(`${baseUrl}/hello`);
      expect(actual.method).toEqual('GET');
      expect(actual.url).toEqual('/hello');
    });

    test('It should keep the query string of the URL', async () => {
      await request(`${baseUrl}/search?q=hello%20world&page=2`);
      expect(received.at(-1)?.url).toEqual('/search?q=hello%20world&page=2');
    });

    test('It should send the Host of the URL', async () => {
      const port = new URL(baseUrl).port;
      await request(`${baseUrl}/hello`);
      expect(received.at(-1)?.headers.host).toEqual(`127.0.0.1:${port}`);
    });

    test('It should return the raw text when the answer is not JSON', async () => {
      const actual = await request(`${baseUrl}/text`);
      expect(actual).toEqual('not json at all');
    });

    test('It should resolve, not reject, on an error status', async () => {
      const actual: any = await request(`${baseUrl}/error`);
      expect(actual.message).toEqual('boom');
    });

    test('It should forward custom headers', async () => {
      await request({
        url: `${baseUrl}/hello`,
        headers: { 'x-custom': 'value' },
      });
      expect(received.at(-1)?.headers['x-custom']).toEqual('value');
    });
  });

  describe('POST', () => {
    test('It should url-encode an object body', async () => {
      const actual: any = await request({
        url: `${baseUrl}/submit`,
        method: 'POST',
        postData: { name: 'Anna', city: 'a b' },
      });
      expect(actual.method).toEqual('POST');
      expect(received.at(-1)?.body).toEqual('name=Anna&city=a+b');
    });

    test('It should set the content type and length of an object body', async () => {
      await request({
        url: `${baseUrl}/submit`,
        method: 'POST',
        postData: { name: 'Anna' },
      });
      const headers = received.at(-1)?.headers;
      expect(headers?.['content-type']).toEqual(
        'application/x-www-form-urlencoded'
      );
      expect(headers?.['content-length']).toEqual('9');
    });

    test('It should measure the content length in bytes, not characters', async () => {
      await request({
        url: `${baseUrl}/submit`,
        method: 'POST',
        postData: '{"city":"München"}',
        headers: { 'Content-Type': 'application/json' },
      });
      const received1 = received.at(-1);
      expect(received1?.body).toEqual('{"city":"München"}');
      expect(received1?.headers['content-length']).toEqual(
        String(Buffer.byteLength('{"city":"München"}'))
      );
    });

    test('It should send a string body untouched', async () => {
      await request({
        url: `${baseUrl}/submit`,
        method: 'POST',
        postData: '{"already":"encoded"}',
        headers: { 'Content-Type': 'application/json' },
      });
      expect(received.at(-1)?.body).toEqual('{"already":"encoded"}');
      expect(received.at(-1)?.headers['content-type']).toEqual(
        'application/json'
      );
    });
  });

  describe('Proxy', () => {
    test('It should route a plain HTTP request through the proxy', async () => {
      const proxied: (string | undefined)[] = [];
      const proxy = http.createServer((req, res) => {
        proxied.push(req.url);
        const target = new URL(req.url as string);
        const upstream = http.request(
          {
            host: target.hostname,
            port: target.port,
            path: `${target.pathname}${target.search}`,
            method: req.method,
            headers: req.headers,
          },
          (upstreamRes) => {
            res.writeHead(
              upstreamRes.statusCode as number,
              upstreamRes.headers
            );
            upstreamRes.pipe(res);
          }
        );
        req.pipe(upstream);
      });
      const proxyPort = await listen(proxy);
      try {
        const actual: any = await request({
          url: `${baseUrl}/through-proxy`,
          proxy: `http://127.0.0.1:${proxyPort}`,
        });
        expect(actual.url).toEqual('/through-proxy');
        expect(proxied).toHaveLength(1);
        expect(proxied[0]).toEqual(`${baseUrl}/through-proxy`);
      } finally {
        await close(proxy);
      }
    });

    test('It should tunnel an HTTPS request through the proxy with CONNECT', async () => {
      const connects: (string | undefined)[] = [];
      const proxy = http.createServer((_req, res) => {
        res.writeHead(405).end();
      });
      proxy.on('connect', (req, socket) => {
        connects.push(req.url);
        // Refuse the tunnel: the assertion is on the CONNECT target, and no
        // TLS endpoint is needed to observe it.
        socket.end('HTTP/1.1 502 Bad Gateway\r\n\r\n');
      });
      const proxyPort = await listen(proxy);
      try {
        // The refused tunnel may surface as a rejection or as an empty
        // answer; what matters is that the proxy saw the right CONNECT.
        await request({
          url: 'https://example.invalid/secure',
          proxy: `http://127.0.0.1:${proxyPort}`,
        }).catch(() => undefined);
        expect(connects).toEqual(['example.invalid:443']);
      } finally {
        await close(proxy);
      }
    });

    test('It should take the proxy from the environment when not given', async () => {
      const proxied: (string | undefined)[] = [];
      const proxy = http.createServer((req, res) => {
        proxied.push(req.url);
        const target = new URL(req.url as string);
        const upstream = http.request(
          {
            host: target.hostname,
            port: target.port,
            path: `${target.pathname}${target.search}`,
            method: req.method,
            headers: req.headers,
          },
          (upstreamRes) => {
            res.writeHead(
              upstreamRes.statusCode as number,
              upstreamRes.headers
            );
            upstreamRes.pipe(res);
          }
        );
        req.pipe(upstream);
      });
      const proxyPort = await listen(proxy);
      process.env.http_proxy = `http://127.0.0.1:${proxyPort}`;
      try {
        await request(`${baseUrl}/from-env`);
        expect(proxied).toEqual([`${baseUrl}/from-env`]);
      } finally {
        await close(proxy);
      }
    });
  });

  describe('Errors', () => {
    test('It should reject when the host refuses the connection', async () => {
      const port = new URL(baseUrl).port;
      await close(server);
      await expect(request(`http://127.0.0.1:${port}/hello`)).rejects.toThrow(
        /ECONNREFUSED/
      );
      server = http.createServer((req, res) => {
        void handle(req, res);
      });
      await listen(server);
    });
  });
});
