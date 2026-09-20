import http from 'node:http';
import { containerBootstrap } from '@nlpjs-neo/core';
import { BuiltinDuckling } from '../src/index.js';

type ReceivedRequest = {
  method: string | undefined;
  url: string | undefined;
  headers: http.IncomingHttpHeaders;
  body: string;
};

let server: http.Server;
let baseUrl: string;
let received: ReceivedRequest[];
let answer: { status: number; body: string };

beforeEach(async () => {
  received = [];
  answer = { status: 200, body: '[]' };
  server = http.createServer((req, res) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      received.push({
        method: req.method,
        url: req.url,
        headers: req.headers,
        body,
      });
      res.writeHead(answer.status, { 'Content-Type': 'application/json' });
      res.end(answer.body);
    });
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
});

afterEach(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

function newDuckling(ducklingUrl = `${baseUrl}/parse`) {
  return new BuiltinDuckling({
    ducklingUrl,
    container: containerBootstrap(),
  });
}

describe('BuiltinDuckling request', () => {
  test('It should POST the utterance and the culture, url-encoded', async () => {
    const duckling = newDuckling();
    await duckling.request('The number is 42', 'en');
    const [call] = received;
    expect(call.method).toEqual('POST');
    expect(call.url).toEqual('/parse');
    expect(call.headers['content-type']).toEqual(
      'application/x-www-form-urlencoded'
    );
    expect(Object.fromEntries(new URLSearchParams(call.body))).toEqual({
      text: 'The number is 42',
      locale: 'en_US',
    });
    expect(call.headers['content-length']).toEqual(
      String(Buffer.byteLength(call.body))
    );
  });

  test('It should encode characters that need it', async () => {
    const duckling = newDuckling();
    await duckling.request('caña & 50% más', 'es');
    const fields = Object.fromEntries(new URLSearchParams(received[0].body));
    expect(fields).toEqual({ text: 'caña & 50% más', locale: 'es_ES' });
    expect(received[0].body).not.toContain(' ');
  });

  test('It should map the language to a duckling culture', async () => {
    const duckling = newDuckling();
    await duckling.request('hola', 'pt');
    expect(
      Object.fromEntries(new URLSearchParams(received[0].body)).locale
    ).toEqual('pt_BR');
  });

  test('It should resolve with the parsed answer', async () => {
    answer = {
      status: 200,
      body: '[{"body":"42","dim":"number","value":{"value":42}}]',
    };
    const duckling = newDuckling();
    const actual: any = await duckling.request('The number is 42', 'en');
    expect(actual).toHaveLength(1);
    expect(actual[0].dim).toEqual('number');
  });

  test('It should reject when the answer is not JSON', async () => {
    answer = { status: 500, body: 'Internal Server Error' };
    const duckling = newDuckling();
    await expect(duckling.request('hello', 'en')).rejects.toThrow(
      /JSON|Unexpected/
    );
  });

  test('It should reject when the host cannot be reached', async () => {
    const duckling = newDuckling();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await expect(duckling.request('hello', 'en')).rejects.toThrow(
      /ECONNREFUSED/
    );
    server = http.createServer((_req, res) => res.end('[]'));
    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', resolve)
    );
  });

  test('It should keep the path of the configured URL', async () => {
    const duckling = newDuckling(`${baseUrl}/duckling/v1/parse`);
    await duckling.request('hello', 'en');
    expect(received[0].url).toEqual('/duckling/v1/parse');
  });
});
