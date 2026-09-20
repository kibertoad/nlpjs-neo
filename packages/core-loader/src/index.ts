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
import dock, { type Dock } from './dock.js';

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
import type { LoaderSettings } from './types.js';

async function dockStart(
  settings?: LoaderSettings | string,
  mustLoadEnv?: boolean
): Promise<Dock> {
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

export type { Dock } from './dock.js';
export type {
  LoaderConfiguration,
  LoaderSettings,
  PluginEntry,
  PluginInformation,
} from './types.js';
export type {
  AmongMethod,
  JsonExportRules,
  JsonImportRules,
} from '@nlpjs-neo/core';
export type {
  ChildPipeline,
  ChildSettings,
  CompiledPipeline,
  Compiler,
  CompilerConstructor,
  ConfigurableService,
  ContainerConfiguration,
  ContainerHolder,
  ContainerPlugin,
  FactoryItem,
  Locale,
  Logger,
  NormalizeFlag,
  NormalizerService,
  PipelineExecutionContext,
  PipelineInput,
  PipelineResult,
  PipelineToken,
  RegisteredPipeline,
  RehydratedInstance,
  ResolvedPath,
  ResolvedValue,
  SerializedInstance,
  ServiceConstructor,
  ServiceInstance,
  Settings,
  StemmerDictionary,
  StemmerService,
  StopwordDictionary,
  StopwordsService,
  Storage,
  StorageItem,
  TerraformEntry,
  Token,
  TokenMap,
  Tokens,
  TokenizerService,
} from '@nlpjs-neo/core';
