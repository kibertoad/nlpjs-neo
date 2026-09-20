import { defaultContainer, type Container } from './container.js';
import type {
  Logger,
  RegisteredPipeline,
  SerializedInstance,
  Settings,
} from './types.js';

/**
 * Rule for one property of a `toJSON`/`fromJSON` mapping: `false` skips the
 * property, `true` copies it, a string renames it and a function computes the
 * value to store or restore.
 */
type JsonRule<TArgs extends unknown[]> =
  | boolean
  | string
  | ((...args: TArgs) => unknown);

/** Rules applied by `toJSON`, keyed by property name. */
export type JsonExportRules = Record<
  string,
  JsonRule<
    [result: SerializedInstance, instance: Clonable, key: string, value: any]
  >
>;

/** Rules applied by `fromJSON`, keyed by property name. */
export type JsonImportRules = Record<
  string,
  JsonRule<
    [instance: Clonable, json: SerializedInstance, key: string, value: any]
  >
>;

class Clonable {
  declare container: Container;
  /** Per property rules used when serializing this instance. */
  declare jsonExport: JsonExportRules | undefined;
  /** Per property rules used when restoring this instance. */
  declare jsonImport: JsonImportRules | undefined;
  /** Default pipeline of this instance: a tag or the pipeline lines. */
  declare pipeline: string | string[] | undefined;

  /**
   * Constructor of the class
   */
  constructor(
    settings: Settings = {},
    container: Container = defaultContainer
  ) {
    this.container = settings.container || container;
    this.applySettings(this, settings);
  }

  get logger(): Logger {
    return this.container.get<Logger>('logger');
  }

  /**
   * Applies default settings to an object: every key missing from the target
   * is taken from the settings.
   * @param srcobj Target object.
   * @param settings Input settings.
   */
  applySettings<T>(srcobj: T, settings: Settings = {}): T {
    const obj = (srcobj || {}) as Record<string, unknown>;
    Object.keys(settings).forEach((key) => {
      if (obj[key] === undefined) {
        obj[key] = settings[key];
      }
    });
    return obj as T;
  }

  toJSON(): SerializedInstance {
    const settings = this.jsonExport || {};
    const result: SerializedInstance = {};
    const keys = Object.keys(this);
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      if (
        key !== 'jsonExport' &&
        key !== 'jsonImport' &&
        key !== 'container' &&
        !key.startsWith('pipeline')
      ) {
        const fn = settings[key] === undefined ? true : settings[key];
        if (typeof fn === 'function') {
          const value = fn.bind(this)(result, this, key, this[key]);
          if (value) {
            result[key] = value;
          }
        } else if (typeof fn === 'boolean') {
          if (fn) {
            result[key] = this[key];
            if (key === 'settings') {
              delete (result[key] as Settings).container;
            }
          }
        } else if (typeof fn === 'string') {
          result[fn] = this[key];
        }
      }
    }
    return result;
  }

  fromJSON(json: SerializedInstance): void {
    const settings = this.jsonImport || {};
    const keys = Object.keys(json);
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      const fn = settings[key] === undefined ? true : settings[key];
      if (typeof fn === 'function') {
        const value = fn.bind(this)(this, json, key, json[key]);
        if (value) {
          this[key] = value;
        }
      } else if (typeof fn === 'boolean') {
        if (fn) {
          this[key] = json[key];
        }
      } else if (typeof fn === 'string') {
        this[fn] = json[key];
      }
    }
  }

  objToValues<T>(obj: Record<string, T>, srcKeys?: string[]): T[] {
    const keys = srcKeys || Object.keys(obj);
    const result: T[] = [];
    for (let i = 0; i < keys.length; i += 1) {
      result.push(obj[keys[i]]);
    }
    return result;
  }

  valuesToObj<T>(values: T[], keys: string[]): Record<string, T> {
    const result: Record<string, T> = {};
    for (let i = 0; i < values.length; i += 1) {
      result[keys[i]] = values[i];
    }
    return result;
  }

  getPipeline(tag: string): RegisteredPipeline | undefined {
    return this.container.getPipeline(tag);
  }

  // The result is whatever the last step of the pipeline returns.
  async runPipeline(
    input: unknown,
    pipeline?: string | string[] | RegisteredPipeline
  ): Promise<any> {
    return this.container.runPipeline(pipeline || this.pipeline, input, this);
  }

  use(item: Parameters<Container['use']>[0]): void {
    this.container.use(item);
  }
}

export default Clonable;
