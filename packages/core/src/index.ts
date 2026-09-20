import Among from './among.js';
import ArrToObj from './arr-to-obj.js';
import BaseStemmer from './base-stemmer.js';
import containerBootstrap from './container-bootstrap.js';
import Clonable from './clonable.js';
import { Container, defaultContainer } from './container.js';
import Normalizer from './normalizer.js';
import ObjToArr from './obj-to-arr.js';
import Stemmer from './stemmer.js';
import Stopwords from './stopwords.js';
import Tokenizer from './tokenizer.js';
import Timer from './timer.js';
import logger from './logger.js';
import {
  hasUnicode,
  unicodeToArray,
  asciiToArray,
  stringToArray,
  compareWildcars,
  loadEnvFromJson,
} from './helper.js';
import MemoryStorage from './memory-storage.js';
import uuid from './uuid.js';
import dock, { type Dock } from './dock.js';
import Context from './context.js';
import type { ContainerConfiguration } from './types.js';

async function dockStart(
  settings?: ContainerConfiguration | string,
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
  loadEnvFromJson,
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

export type { AmongMethod } from './among.js';
export type { Dock } from './dock.js';
export type { JsonExportRules, JsonImportRules } from './clonable.js';
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
} from './types.js';
