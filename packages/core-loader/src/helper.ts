import fs from 'fs';
import path from 'path';

import {
  hasUnicode,
  unicodeToArray,
  asciiToArray,
  stringToArray,
  compareWildcars,
  loadEnvFromJson,
} from '@nlpjs-neo/core';

function listFiles(folderPath: string, recursive = true): string[] {
  if (fs.existsSync(folderPath)) {
    const all = fs.readdirSync(folderPath).map((x) => path.join(folderPath, x));
    const files = all.filter((x) => fs.statSync(x).isFile());
    if (recursive) {
      const dirs = all.filter((x) => !files.includes(x));
      const dirFiles = dirs.reduce<string[]>(
        (prev, current) => prev.concat(listFiles(current)),
        []
      );
      return [...files, ...dirFiles];
    }
    return files;
  }
  return [];
}

function getAbsolutePath(relative = ''): string {
  if (path.isAbsolute(relative)) {
    return relative;
  }
  return path.normalize(path.join(process.cwd(), relative));
}

function listFilesAbsolute(folderPath: string, recursive = true): string[] {
  const files = listFiles(folderPath, recursive);
  return files.map((x) => getAbsolutePath(x));
}

function loadEnv(fileName = '.env'): void {
  const absolutePath = getAbsolutePath(fileName);
  if (fs.existsSync(absolutePath)) {
    const content = fs.readFileSync(absolutePath, 'utf8');
    const lines = content.split(/\n|\r|\r\n/);
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      const keyValueArr = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (keyValueArr) {
        const key = keyValueArr[1];
        let val = keyValueArr[2] || '';
        const endVal = val.length - 1;
        const isDoubleQuoted = val[0] === '"' && val[endVal] === '"';
        const isSingleQuoted = val[0] === "'" && val[endVal] === "'";
        if (isSingleQuoted || isDoubleQuoted) {
          val = val.substring(1, endVal);
          if (isDoubleQuoted) {
            val = val.replace(/\\n/g, '\n');
          }
        } else {
          val = val.trim();
        }
        if (process.env[key] === undefined) {
          process.env[key] = val;
        }
      }
    }
  }
}

export {
  hasUnicode,
  unicodeToArray,
  asciiToArray,
  stringToArray,
  compareWildcars,
  getAbsolutePath,
  listFiles,
  listFilesAbsolute,
  loadEnv,
  loadEnvFromJson,
};
