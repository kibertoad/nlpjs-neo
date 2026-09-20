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
import { fileURLToPath } from 'node:url';
import { Downloader } from '../src/index.js';

const fixturesDir = fileURLToPath(new URL('./fixtures', import.meta.url));
const tarball = fs.readFileSync(path.join(fixturesDir, 'model.tar.gz'));
const plainBody = 'plain file contents\n';

type Fixture = {
  baseUrl: string;
  dir: string;
  requests: { url: string | undefined; host: string | undefined }[];
};

const proxyEnvVars = ['http_proxy', 'https_proxy', 'HTTP_PROXY', 'HTTPS_PROXY'];

let fixture: Fixture;
let server: http.Server;
let savedProxyEnv: Record<string, string | undefined>;

/** Routes every request the tests need, and records what actually arrived. */
function handle(req: http.IncomingMessage, res: http.ServerResponse) {
  fixture.requests.push({ url: req.url, host: req.headers.host });
  const requestPath = new URL(req.url ?? '/', 'http://localhost').pathname;
  if (requestPath.endsWith('model.tar.gz')) {
    res.writeHead(200, {
      'Content-Type': 'application/gzip',
      'Content-Length': tarball.length,
    });
    res.end(tarball);
    return;
  }
  if (requestPath.endsWith('missing.txt')) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('not found');
    return;
  }
  res.writeHead(200, {
    'Content-Type': 'text/plain',
    'Content-Length': Buffer.byteLength(plainBody),
  });
  res.end(plainBody);
}

beforeEach(async () => {
  // The downloader falls back to the ambient proxy configuration, so clear it
  // to keep the suite independent of the machine it runs on.
  savedProxyEnv = Object.fromEntries(
    proxyEnvVars.map((name) => [name, process.env[name]])
  );
  for (const name of proxyEnvVars) {
    delete process.env[name];
  }
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'downloader-'));
  server = http.createServer(handle);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as { port: number };
  fixture = { baseUrl: `http://127.0.0.1:${port}`, dir, requests: [] };
});

afterEach(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
  fs.rmSync(fixture.dir, { recursive: true, force: true });
  for (const [name, value] of Object.entries(savedProxyEnv)) {
    if (value === undefined) {
      delete process.env[name];
    } else {
      process.env[name] = value;
    }
  }
});

function newDownloader(settings: Record<string, unknown> = {}) {
  return new Downloader({ dir: fixture.dir, showProgress: false, ...settings });
}

describe('Downloader', () => {
  describe('constructor', () => {
    test('It should create a new instance', () => {
      const downloader = new Downloader();
      expect(downloader).toBeDefined();
      expect(downloader.replicateAllFolders).toEqual(false);
      expect(downloader.replaceIfExists).toEqual(true);
      expect(downloader.showProgress).toEqual(true);
      expect(downloader.automaticUntar).toEqual(true);
    });
    test('A proxy can be provided', () => {
      const proxy = 'http://192.168.1.1:3128';
      const downloader = new Downloader({ proxy });
      expect(downloader.proxy).toEqual(proxy);
      expect(downloader.agent).toBeDefined();
    });
    test('The proxy is taken from the environment when not provided', () => {
      process.env.https_proxy = 'http://192.168.1.2:3128';
      const downloader = new Downloader();
      expect(downloader.proxy).toEqual('http://192.168.1.2:3128');
      expect(downloader.agent).toBeDefined();
    });
    test('Parameters can be provided', () => {
      const downloader = new Downloader({
        replicateAllFolders: true,
        replaceIfExists: false,
        showProgress: false,
        automaticUntar: false,
      });
      expect(downloader).toBeDefined();
      expect(downloader.replicateAllFolders).toEqual(true);
      expect(downloader.replaceIfExists).toEqual(false);
      expect(downloader.showProgress).toEqual(false);
      expect(downloader.automaticUntar).toEqual(false);
    });
  });

  describe('download', () => {
    test('It should download a file into the target folder', async () => {
      const downloader = newDownloader();
      const info: any = await downloader.download(
        `${fixture.baseUrl}/files/plain.txt`
      );
      expect(info.mime).toEqual('text/plain');
      expect(info.size).toEqual(Buffer.byteLength(plainBody));
      const downloaded = path.join(fixture.dir, 'plain.txt');
      expect(fs.readFileSync(downloaded, 'utf8')).toEqual(plainBody);
    });

    test('It should request the path of the URL', async () => {
      const downloader = newDownloader();
      await downloader.download(
        `${fixture.baseUrl}/files/plain.txt`,
        'named.txt'
      );
      expect(
        fs.readFileSync(path.join(fixture.dir, 'named.txt'), 'utf8')
      ).toEqual(plainBody);
      expect(fixture.requests.at(-1)?.url).toEqual('/files/plain.txt');
    });

    test('It should honor an explicit target file name', async () => {
      const downloader = newDownloader();
      await downloader.download(
        `${fixture.baseUrl}/plain.txt`,
        'sub/renamed.txt'
      );
      const downloaded = path.join(fixture.dir, 'sub', 'renamed.txt');
      expect(fs.readFileSync(downloaded, 'utf8')).toEqual(plainBody);
    });

    test('It should replicate the URL folders when asked to', async () => {
      const downloader = newDownloader({ replicateAllFolders: true });
      await downloader.download(`${fixture.baseUrl}/a/b/plain.txt`);
      const downloaded = path.join(fixture.dir, 'a', 'b', 'plain.txt');
      expect(fs.readFileSync(downloaded, 'utf8')).toEqual(plainBody);
    });

    test('It should untar a .tar.gz stripping the first path segment', async () => {
      const downloader = newDownloader();
      await downloader.download(`${fixture.baseUrl}/model.tar.gz`);
      expect(
        fs.readFileSync(path.join(fixture.dir, 'info.txt'), 'utf8')
      ).toEqual('downloaded-model\n');
      expect(
        JSON.parse(
          fs.readFileSync(path.join(fixture.dir, 'nested', 'data.json'), 'utf8')
        )
      ).toEqual({ name: 'fixture' });
    });

    test('It should untar into the folder of the target file', async () => {
      const downloader = newDownloader();
      await downloader.download(
        `${fixture.baseUrl}/model.tar.gz`,
        'models/model.tar.gz'
      );
      expect(
        fs.readFileSync(path.join(fixture.dir, 'models', 'info.txt'), 'utf8')
      ).toEqual('downloaded-model\n');
    });

    test('It should not download again when the file exists and replaceIfExists is false', async () => {
      const downloader = newDownloader({ replaceIfExists: false });
      await downloader.download(`${fixture.baseUrl}/plain.txt`);
      const requestsAfterFirst = fixture.requests.length;
      const result = await downloader.download(`${fixture.baseUrl}/plain.txt`);
      expect(result).toEqual('Already exists');
      expect(fixture.requests).toHaveLength(requestsAfterFirst);
    });

    test('It should reject when the server answers with an error status', async () => {
      const downloader = newDownloader();
      await expect(
        downloader.download(`${fixture.baseUrl}/missing.txt`)
      ).rejects.toThrow('(404)');
    });

    test('It should reject when the host cannot be reached', async () => {
      const downloader = newDownloader();
      await new Promise<void>((resolve) => server.close(() => resolve()));
      await expect(
        downloader.download(`${fixture.baseUrl}/plain.txt`)
      ).rejects.toThrow(/ECONNREFUSED/);
      server = http.createServer(handle);
      await new Promise<void>((resolve) =>
        server.listen(0, '127.0.0.1', resolve)
      );
    });
  });
});
