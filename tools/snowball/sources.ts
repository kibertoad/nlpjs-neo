/**
 * Where the Snowball programs come from.
 *
 * The programs are not kept in this repository: each stemmer names the address
 * of its program at a version of Snowball that does not change, and the
 * checksum the program has to have. A program is downloaded once into
 * `.cache/` (which is ignored by git), checked, edited with our changes, and
 * read from there afterwards.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { Edit } from './edits.ts';

export interface Source {
  /** Address of the program, at a tag or a commit. */
  url: string;
  /** SHA-256 of the program as published. */
  sha256: string;
  /** Our changes to it. */
  edits?: Edit[];
}

export const CACHE = fileURLToPath(new URL('.cache/', import.meta.url));

const sha256Of = (bytes: Uint8Array): string =>
  createHash('sha256').update(bytes).digest('hex');

/** Whether the program of a source has been downloaded already. */
export function isCached(source: Source, cache = CACHE): boolean {
  return existsSync(`${cache}${source.sha256}.sbl`);
}

/** The program as published, from the cache or from its address. */
export async function fetchProgram(
  source: Source,
  cache = CACHE
): Promise<string> {
  const file = `${cache}${source.sha256}.sbl`;
  if (existsSync(file)) {
    return readFileSync(file, 'utf8');
  }
  const response = await fetch(source.url);
  if (!response.ok) {
    throw new Error(`${source.url}: ${response.status}`);
  }
  const bytes = new Uint8Array(await response.arrayBuffer());
  const found = sha256Of(bytes);
  if (found !== source.sha256) {
    throw new Error(
      `${source.url} is not the program that was expected: its checksum is ${found}, not ${source.sha256}`
    );
  }
  mkdirSync(cache, { recursive: true });
  writeFileSync(file, bytes);
  return new TextDecoder().decode(bytes);
}

/** Replaces each `find` of the edits, which has to be in the program exactly once. */
export function applyEdits(text: string, edits: Edit[], url: string): string {
  let result = text;
  for (const { find, replace } of edits) {
    const at = result.indexOf(find);
    if (at < 0 || result.indexOf(find, at + find.length) >= 0) {
      throw new Error(
        `${url}: an edit has to match once, and ${at < 0 ? 'this does not match' : 'this matches twice'}:\n${find.split('\n')[0]}`
      );
    }
    result = result.slice(0, at) + replace + result.slice(at + find.length);
  }
  return result;
}

/** The program of a source, as it is compiled: fetched, checked and edited. */
export async function loadProgram(
  source: Source,
  cache = CACHE
): Promise<string> {
  const text = (await fetchProgram(source, cache)).split('\r\n').join('\n');
  return source.edits ? applyEdits(text, source.edits, source.url) : text;
}
