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

function loadPipelinesStr(instance, pipelines) {
  instance.loadPipelinesFromString(pipelines);
}

function traverse(obj, preffix) {
  if (typeof obj === 'string') {
    if (obj.startsWith('$')) {
      return (
        process.env[`${preffix}${obj.slice(1)}`] || process.env[obj.slice(1)]
      );
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((x) => traverse(x, preffix));
  }
  if (typeof obj === 'object') {
    const keys = Object.keys(obj);
    const result: any = {};
    for (let i = 0; i < keys.length; i += 1) {
      result[keys[i]] = traverse(obj[keys[i]], preffix);
    }
    return result;
  }
  return obj;
}

function containerBootstrap(
  inputSettings?,
  mustLoadEnv?,
  container?,
  preffix?,
  pipelines?,
  parent?
) {
  const srcSettings = inputSettings || {};
  const instance = container || new Container(preffix);
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
  let configuration;
  configuration = settings;
  configuration = traverse(configuration, preffix ? `${preffix}_` : '');
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
        instance.register(item[0], item[1]);
      } else {
        instance.use(item);
      }
    }
  }
  if (configuration.terraform) {
    for (let i = 0; i < configuration.terraform.length; i += 1) {
      const current = configuration.terraform[i];
      const terra = instance.get(current.className);
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
