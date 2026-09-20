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
import { ZipArchive } from 'archiver';
import os from 'node:os';
import path from 'node:path';
import {
  backup,
  compressFolder,
  ensureDir,
  getDateStr,
  getDateTimeStr,
  getTimeStr,
  getUrlFileName,
  mount,
  pad,
  removeDir,
  restore,
} from '../src/utils.js';

const proxyEnvVars = ['http_proxy', 'https_proxy', 'HTTP_PROXY', 'HTTPS_PROXY'];

let workDir: string;
let savedProxyEnv: Record<string, string | undefined>;

function makeTree(root: string) {
  ensureDir(path.join(root, 'nested'));
  fs.writeFileSync(path.join(root, 'top.txt'), 'top level\n');
  fs.writeFileSync(
    path.join(root, 'nested', 'data.json'),
    JSON.stringify({ name: 'fixture' })
  );
}

function listFiles(root: string) {
  return fs
    .readdirSync(root, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) =>
      path.relative(root, path.join(entry.parentPath, entry.name))
    )
    .sort();
}

beforeEach(() => {
  savedProxyEnv = Object.fromEntries(
    proxyEnvVars.map((name) => [name, process.env[name]])
  );
  for (const name of proxyEnvVars) {
    delete process.env[name];
  }
  workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fullbot-utils-'));
});

afterEach(() => {
  fs.rmSync(workDir, { recursive: true, force: true });
  for (const [name, value] of Object.entries(savedProxyEnv)) {
    if (value === undefined) {
      delete process.env[name];
    } else {
      process.env[name] = value;
    }
  }
});

describe('FullBot utils', () => {
  describe('Date helpers', () => {
    test('pad should left-pad to the requested length', () => {
      expect(pad(7)).toEqual('07');
      expect(pad(7, 4)).toEqual('0007');
      expect(pad(1234, 2)).toEqual('1234');
    });

    test('It should format a date, a time and both', () => {
      const date = new Date(2026, 8, 20, 4, 5, 6);
      expect(getDateStr(date)).toEqual('20260920');
      expect(getTimeStr(date)).toEqual('040506');
      expect(getDateTimeStr(date)).toEqual('20260920040506');
    });
  });

  describe('getUrlFileName', () => {
    test('It should take the last segment of an URL', () => {
      expect(getUrlFileName('https://host/a/b/model.zip')).toEqual('model.zip');
      expect(getUrlFileName('model.zip')).toEqual('model.zip');
    });
  });

  describe('ensureDir', () => {
    test('It should create nested folders and be idempotent', () => {
      const target = path.join(workDir, 'a', 'b', 'c');
      ensureDir(target);
      ensureDir(target);
      expect(fs.existsSync(target)).toEqual(true);
    });
  });

  describe('removeDir', () => {
    test('It should remove a folder with contents', () => {
      const target = path.join(workDir, 'tree');
      makeTree(target);
      removeDir(target);
      expect(fs.existsSync(target)).toEqual(false);
    });

    test('It should not fail for a folder that does not exist', () => {
      expect(() => removeDir(path.join(workDir, 'absent'))).not.toThrow();
    });
  });

  describe('compressFolder and restore', () => {
    test('It should round-trip a folder through a zip file', async () => {
      const src = path.join(workDir, 'src');
      const zipName = path.join(workDir, 'out.zip');
      const tgt = path.join(workDir, 'tgt');
      makeTree(src);
      await compressFolder(src, zipName);
      expect(fs.existsSync(zipName)).toEqual(true);
      await restore(zipName, tgt);
      expect(listFiles(tgt)).toEqual([
        path.join('nested', 'data.json'),
        'top.txt',
      ]);
      expect(fs.readFileSync(path.join(tgt, 'top.txt'), 'utf8')).toEqual(
        'top level\n'
      );
    });

    test('restore should create the target folder when missing', async () => {
      const src = path.join(workDir, 'src');
      const zipName = path.join(workDir, 'out.zip');
      const tgt = path.join(workDir, 'deep', 'tgt');
      makeTree(src);
      await compressFolder(src, zipName);
      await restore(zipName, tgt);
      expect(fs.existsSync(path.join(tgt, 'top.txt'))).toEqual(true);
    });

    test('restore should reject for a file that is not a zip', async () => {
      const notAZip = path.join(workDir, 'not-a-zip.zip');
      fs.writeFileSync(notAZip, 'definitely not a zip archive');
      const tgt = path.join(workDir, 'tgt');
      await expect(restore(notAZip, tgt)).rejects.toThrow('Bad archive');
      expect(listFiles(tgt)).toEqual([]);
    });

    test('restore should not write outside the target folder', async () => {
      const zipName = path.join(workDir, 'evil.zip');
      const tgt = path.join(workDir, 'tgt');
      await new Promise<void>((resolve, reject) => {
        const output = fs.createWriteStream(zipName);
        const archive = new ZipArchive();
        output.on('close', () => resolve());
        archive.on('error', reject);
        archive.pipe(output);
        archive.append('pwned', { name: '../../escaped.txt' });
        archive.append('fine', { name: 'inside.txt' });
        archive.finalize();
      });
      await restore(zipName, tgt).catch(() => undefined);
      expect(fs.existsSync(path.join(workDir, 'escaped.txt'))).toEqual(false);
      expect(fs.existsSync(path.resolve(workDir, '..', 'escaped.txt'))).toEqual(
        false
      );
    });
  });

  describe('backup', () => {
    test('It should write a timestamped zip into the target folder', async () => {
      const src = path.join(workDir, 'src');
      const backupFolder = path.join(workDir, 'backups');
      makeTree(src);
      const created = await backup(src, backupFolder);
      expect(path.dirname(created)).toEqual(backupFolder);
      expect(path.basename(created)).toMatch(/^backup_\d{14}\.zip$/);
      expect(fs.existsSync(created)).toEqual(true);
      const restored = path.join(workDir, 'restored');
      await restore(created, restored);
      expect(listFiles(restored)).toEqual([
        path.join('nested', 'data.json'),
        'top.txt',
      ]);
    });
  });

  describe('mount', () => {
    let server: http.Server;
    let baseUrl: string;
    let zipBody: Buffer;

    beforeEach(async () => {
      const src = path.join(workDir, 'remote');
      const zipName = path.join(workDir, 'remote.zip');
      makeTree(src);
      fs.writeFileSync(path.join(src, 'top.txt'), 'from the server\n');
      await compressFolder(src, zipName);
      zipBody = fs.readFileSync(zipName);
      server = http.createServer((_req, res) => {
        res.writeHead(200, {
          'Content-Type': 'application/zip',
          'Content-Length': zipBody.length,
        });
        res.end(zipBody);
      });
      await new Promise<void>((resolve) =>
        server.listen(0, '127.0.0.1', resolve)
      );
      baseUrl = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
    });

    afterEach(async () => {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    });

    test('It should download an archive, back up the folder and restore', async () => {
      const dir = path.join(workDir, 'bot');
      const backupFolder = path.join(workDir, 'bot-backups');
      makeTree(dir);
      fs.writeFileSync(path.join(dir, 'top.txt'), 'the old content\n');

      const actual = await mount({
        url: `${baseUrl}/model.zip`,
        fileName: 'model.zip',
        dir,
        tmpFolder: path.join(workDir, 'tmp'),
        backupFolder,
        showProgress: false,
      });

      expect(actual).toEqual(true);
      expect(fs.readFileSync(path.join(dir, 'top.txt'), 'utf8')).toEqual(
        'from the server\n'
      );
      const backups = fs.readdirSync(backupFolder);
      expect(backups).toHaveLength(1);
      const previous = path.join(workDir, 'previous');
      await restore(path.join(backupFolder, backups[0]), previous);
      expect(fs.readFileSync(path.join(previous, 'top.txt'), 'utf8')).toEqual(
        'the old content\n'
      );
    });

    test('It should roll back to the backup when the archive is broken', async () => {
      const dir = path.join(workDir, 'bot');
      const backupFolder = path.join(workDir, 'bot-backups');
      makeTree(dir);
      fs.writeFileSync(path.join(dir, 'top.txt'), 'the old content\n');
      zipBody = Buffer.from('definitely not a zip archive');

      const actual = await mount({
        url: `${baseUrl}/model.zip`,
        fileName: 'model.zip',
        dir,
        tmpFolder: path.join(workDir, 'tmp'),
        backupFolder,
        showProgress: false,
      });

      expect(actual).toEqual(false);
      expect(fs.readFileSync(path.join(dir, 'top.txt'), 'utf8')).toEqual(
        'the old content\n'
      );
    });

    test('It should remove the temporary folder by default', async () => {
      const dir = path.join(workDir, 'bot');
      const tmpFolder = path.join(workDir, 'tmp');
      makeTree(dir);
      await mount({
        url: `${baseUrl}/model.zip`,
        fileName: 'model.zip',
        dir,
        tmpFolder,
        backup: false,
        showProgress: false,
      });
      expect(fs.existsSync(tmpFolder)).toEqual(false);
    });

    test('It should keep the temporary folder when asked to', async () => {
      const dir = path.join(workDir, 'bot');
      const tmpFolder = path.join(workDir, 'tmp');
      makeTree(dir);
      await mount({
        url: `${baseUrl}/model.zip`,
        fileName: 'model.zip',
        dir,
        tmpFolder,
        backup: false,
        removeTmp: false,
        showProgress: false,
      });
      expect(fs.existsSync(path.join(tmpFolder, 'model.zip'))).toEqual(true);
    });
  });
});
