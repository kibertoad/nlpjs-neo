import {
  Among,
  ArrToObj,
  BaseStemmer,
  Clonable,
  Container,
  defaultContainer,
  Normalizer,
  ObjToArr,
  Stemmer,
  Stopwords,
  Tokenizer,
  Timer,
  logger,
  MemoryStorage,
  uuid,
  Context,
} from '@nlpjs-neo/core';

import containerBootstrap from './container-bootstrap.js';
import dock from './dock.js';

import {
  hasUnicode,
  unicodeToArray,
  asciiToArray,
  stringToArray,
  compareWildcars,
  listFiles,
  loadEnv,
  listFilesAbsolute,
  getAbsolutePath,
} from './helper.js';

async function dockStart(settings, mustLoadEnv?) {
  await dock.start(settings, mustLoadEnv);
  return dock;
}

export {
  Among,
  ArrToObj,
  BaseStemmer,
  containerBootstrap,
  Clonable,
  Container,
  defaultContainer,
  hasUnicode,
  unicodeToArray,
  asciiToArray,
  stringToArray,
  compareWildcars,
  getAbsolutePath,
  listFiles,
  listFilesAbsolute,
  loadEnv,
  Normalizer,
  ObjToArr,
  Stemmer,
  Stopwords,
  Tokenizer,
  Timer,
  logger,
  MemoryStorage,
  uuid,
  dock,
  Context,
  dockStart,
};
