import ArrToObj from './arr-to-obj.js';
import { Container } from './container.js';
import Normalizer from './normalizer.js';
import ObjToArr from './obj-to-arr.js';
import { loadEnvFromJson } from './helper.js';
import Stemmer from './stemmer.js';
import Stopwords from './stopwords.js';
import Tokenizer from './tokenizer.js';
import Timer from './timer.js';
import logger from './logger.js';
import MemoryStorage from './memory-storage.js';
import fs from './mock-fs.js';
import type {
  ChildPipeline,
  ContainerConfiguration,
  ServiceConstructor,
  ServiceInstance,
} from './types.js';

function loadPipelinesStr(instance: Container, pipelines: string): void {
  instance.loadPipelinesFromString(pipelines);
}

/**
 * Resolves the `$ENV_VAR` references a configuration may hold, in place of
 * any string value and at any depth. A reference is looked up prefixed first,
 * so a child container can override what its parent reads.
 */
function traverse<T>(obj: T, preffix: string): T {
  if (typeof obj === 'string') {
    if (obj.startsWith('$')) {
      return (process.env[`${preffix}${obj.slice(1)}`] ||
        process.env[obj.slice(1)]) as T;
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((x) => traverse(x, preffix)) as T;
  }
  if (typeof obj === 'object' && obj !== null) {
    const source = obj as Record<string, unknown>;
    const keys = Object.keys(source);
    const result: Record<string, unknown> = {};
    for (let i = 0; i < keys.length; i += 1) {
      result[keys[i]] = traverse(source[keys[i]], preffix);
    }
    return result as T;
  }
  return obj;
}

function containerBootstrap(
  inputSettings?: ContainerConfiguration | string,
  mustLoadEnv?: boolean,
  container?: Container,
  preffix?: string,
  pipelines?: ChildPipeline[],
  parent?: Container
): Container {
  // A string names the file the configuration is loaded from; the loader
  // subclass of this container reads it, so here it carries no settings.
  const srcSettings: ContainerConfiguration =
    typeof inputSettings === 'string' ? {} : inputSettings || {};
  const instance = container || new Container(Boolean(preffix));
  instance.parent = parent;
  if (!preffix) {
    instance.register('fs', fs);
    instance.use(ArrToObj);
    instance.use(Normalizer);
    instance.use(ObjToArr);
    instance.use(Stemmer);
    instance.use(Stopwords);
    instance.use(Tokenizer);
    instance.use(Timer);
    instance.use(logger);
    instance.use(MemoryStorage);
  }
  const settings = srcSettings;
  if (srcSettings.env) {
    loadEnvFromJson(preffix, srcSettings.env);
  }
  const configuration = traverse(settings, preffix ? `${preffix}_` : '');
  if (configuration.settings) {
    const keys = Object.keys(configuration.settings);
    for (let i = 0; i < keys.length; i += 1) {
      instance.registerConfiguration(
        keys[i],
        configuration.settings[keys[i]],
        true
      );
    }
  }
  if (configuration.use) {
    for (let i = 0; i < configuration.use.length; i += 1) {
      const item = configuration.use[i];
      if (Array.isArray(item)) {
        instance.register(
          item[0],
          item[1] as ServiceConstructor | ServiceInstance
        );
      } else {
        instance.use(item);
      }
    }
  }
  if (configuration.terraform) {
    for (let i = 0; i < configuration.terraform.length; i += 1) {
      const current = configuration.terraform[i];
      const terra = instance.get<ServiceInstance>(current.className);
      instance.register(current.name, terra, true);
    }
  }
  if (configuration.childs) {
    instance.childs = configuration.childs;
  }
  if (pipelines) {
    for (let i = 0; i < pipelines.length; i += 1) {
      const pipeline = pipelines[i];
      instance.registerPipeline(
        pipeline.tag,
        pipeline.pipeline,
        pipeline.overwrite
      );
    }
  }
  if (configuration.pipelines) {
    loadPipelinesStr(instance, configuration.pipelines);
  }
  return instance;
}

export default containerBootstrap;
