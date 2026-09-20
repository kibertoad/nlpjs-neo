import { compareWildcars } from './helper.js';
import DefaultCompiler from './default-compiler.js';
import logger from './logger.js';
import type {
  ChildPipeline,
  ChildSettings,
  Compiler,
  CompilerConstructor,
  ConfigurableService,
  ContainerPlugin,
  FactoryItem,
  PipelineExecutionContext,
  PipelineResult,
  RegisteredPipeline,
  RehydratedInstance,
  SerializedInstance,
  ResolvedPath,
  ResolvedValue,
  ServiceConstructor,
  ServiceInstance,
  Settings,
} from './types.js';
import type { Dock } from './dock.js';

const NUMBER_LITERAL_REGEX = /^\d+(?:\.\d+)?$/;

/** An instance that knows how to serialize itself. */
interface Serializable {
  toJSON?(): SerializedInstance;
}

/** A registered service that takes part in the startup of the container. */
interface StartableService {
  start?(): void | Promise<void>;
}

/**
 * Container class
 */
class Container {
  declare cache: {
    /** Registered name matching a wildcard lookup, `null` when none does. */
    bestKeys: Record<string, string | null>;
    pipelines: Record<string, RegisteredPipeline | null>;
  };
  declare childPipelines: Record<string, ChildPipeline[]> | undefined;
  declare classes: Record<string, ServiceConstructor>;
  declare compilers: Record<string, Compiler>;
  declare configurations: Record<string, Settings>;
  /** Set on objects that wrap a container, so `x.container || x` resolves one. */
  declare container: Container | undefined;
  declare factory: Record<string, FactoryItem>;
  /** Name of the app this container was created for, set by the dock. */
  declare name: string | undefined;
  declare parent: Container | undefined;
  declare pipelines: Record<string, RegisteredPipeline>;
  /**
   * Child containers, keyed by name. The bootstrap stores the settings each
   * child is to be built from; the dock replaces them with the containers it
   * built from those settings.
   */
  declare childs: Record<string, ChildSettings | Container> | undefined;
  /** Dock that created this container, set while it is being created. */
  declare dock: Dock | undefined;

  /**
   * Constructor of the class.
   */
  constructor(hasPreffix = false) {
    this.classes = {};
    this.factory = {};
    this.pipelines = {};
    this.configurations = {};
    this.compilers = {};
    this.cache = {
      bestKeys: {},
      pipelines: {},
    };
    this.registerCompiler(DefaultCompiler);
    if (!hasPreffix) {
      this.use(logger);
    }
  }

  registerCompiler(Compiler: CompilerConstructor, name?: string): void {
    const instance = new Compiler(this);
    this.compilers[name || instance.name] = instance;
  }

  addClass(clazz: ServiceConstructor, name?: string): void {
    this.classes[name || clazz.name] = clazz;
  }

  toJSON(instance: object): SerializedInstance {
    const source = instance as Serializable;
    const result: SerializedInstance = source.toJSON
      ? source.toJSON()
      : { ...instance };
    result.className = instance.constructor.name;
    return result;
  }

  fromJSON(obj: SerializedInstance, settings?: Settings): RehydratedInstance {
    const Clazz = this.classes[obj.className];
    let instance;
    if (Clazz) {
      instance = new Clazz(settings);
      if (instance.fromJSON) {
        instance.fromJSON(obj);
      } else {
        Object.assign(instance, obj);
      }
    } else {
      instance = { ...obj };
    }
    delete instance.className;
    return instance;
  }

  register(
    name: string,
    service: ServiceConstructor | ServiceInstance,
    isSingleton = true
  ): void {
    this.cache.bestKeys = {};
    const item: FactoryItem = { name, isSingleton, instance: undefined };
    if (typeof service === 'function') {
      // Only a constructor is ever registered as a function: a singleton is
      // built once here, a transient one on every resolution.
      const Clazz = service as ServiceConstructor;
      item.instance = isSingleton ? new Clazz() : Clazz;
    } else {
      item.instance = isSingleton ? service : service.constructor;
    }
    this.factory[name] = item;
  }

  getBestKey(name: string): string | undefined {
    const cached = this.cache.bestKeys[name];
    if (cached !== undefined) {
      // `null` is the cached answer for "no registered name matches".
      return cached ?? undefined;
    }
    const keys = Object.keys(this.factory);
    for (let i = 0; i < keys.length; i += 1) {
      if (compareWildcars(name, keys[i])) {
        this.cache.bestKeys[name] = keys[i];
        return keys[i];
      }
    }
    this.cache.bestKeys[name] = null;
    return undefined;
  }

  /**
   * Resolves a registered service by name, falling back to the parent
   * container and then to a wildcard match. What a name resolves to is
   * decided at runtime, so callers state the contract they expect:
   * `container.get<Storage>('storage')`.
   *
   * @returns The service, or `undefined` when no name and no wildcard of
   * this container or of its parents matches.
   */
  get<T = unknown>(name: string, settings?: unknown): T | undefined {
    let item = this.factory[name];
    if (!item) {
      if (this.parent) {
        return this.parent.get(name, settings);
      }
      const key = this.getBestKey(name);
      if (key) {
        item = this.factory[key];
      }
      if (!item) {
        return undefined;
      }
    }
    if (item.isSingleton) {
      const instance = item.instance as ConfigurableService | undefined;
      if (instance && instance.applySettings) {
        instance.applySettings(instance.settings, settings);
      }
      // What a name resolves to is the caller's contract, stated as `T`.
      return instance as T | undefined;
    }
    const Clazz = item.instance as ServiceConstructor;
    return new Clazz(settings, this) as T;
  }

  // The literal carries the container itself, so the return type has to be
  // written out: an inferred one would reference the polymorphic `this`.
  buildLiteral(
    subtype: 'number' | 'string' | 'boolean',
    step: string,
    value: number | string | boolean,
    context: PipelineExecutionContext
  ): ResolvedPath {
    return {
      type: 'literal',
      subtype,
      src: step,
      value,
      context,
      container: this,
    };
  }

  resolvePathWithType(
    step: string,
    context: PipelineExecutionContext,
    input: unknown,
    srcObject?: unknown
  ): ResolvedPath {
    const literal = step.trim();
    if (NUMBER_LITERAL_REGEX.test(literal)) {
      return this.buildLiteral('number', step, parseFloat(literal), context);
    }
    if (
      (literal.startsWith('"') && literal.endsWith('"')) ||
      (literal.startsWith("'") && literal.endsWith("'"))
    ) {
      return this.buildLiteral('string', step, literal.slice(1, -1), context);
    }
    const tokens = step.split('.');
    let token = tokens[0].trim();
    if (!token) {
      token = step.startsWith('.') ? 'this' : 'context';
    }
    if (token === 'true') {
      return this.buildLiteral('boolean', step, true, context);
    }
    if (token === 'false') {
      return this.buildLiteral('boolean', step, false, context);
    }
    let currentObject: ResolvedValue = context;
    if (token === 'input' || token === 'output') {
      currentObject = input;
    } else if (token && token !== 'context' && token !== 'this') {
      currentObject = this.get(token) || currentObject[token];
    } else if (token === 'this') {
      currentObject = srcObject;
    }
    for (let i = 1; i < tokens.length; i += 1) {
      const currentToken = tokens[i];
      if (!currentObject || !currentObject[currentToken]) {
        if (i < tokens.length - 1) {
          throw Error(`Path not found in pipeline "${step}"`);
        }
      }
      const prevCurrentObject = currentObject;
      currentObject = currentObject[currentToken];
      if (typeof currentObject === 'function') {
        currentObject = currentObject.bind(prevCurrentObject);
      }
    }
    if (typeof currentObject === 'function') {
      return {
        type: 'function',
        src: step,
        value: currentObject,
        context,
        container: this,
      };
    }
    return {
      type: 'reference',
      src: step,
      value: currentObject,
      context,
      container: this,
    };
  }

  resolvePath(
    step: string,
    context: PipelineExecutionContext,
    input: unknown,
    srcObject?: unknown
  ): ResolvedValue {
    const result = this.resolvePathWithType(step, context, input, srcObject);
    return result ? result.value : result;
  }

  setValue(
    path: string,
    valuePath: string,
    context: PipelineExecutionContext,
    input: unknown,
    srcObject?: unknown
  ): void {
    const value = this.resolvePath(valuePath, context, input, srcObject);
    const tokens = path.split('.');
    const newPath = tokens.slice(0, -1).join('.');
    const currentObject = this.resolvePath(
      newPath || (path.startsWith('.') ? 'this' : ''),
      context,
      input,
      srcObject
    );
    currentObject[tokens[tokens.length - 1]] = value;
  }

  incValue(
    path: string,
    valuePath: string,
    context: PipelineExecutionContext,
    input: unknown,
    srcObject?: unknown
  ): void {
    const value = this.resolvePath(valuePath, context, input, srcObject);
    const tokens = path.split('.');
    const newPath = tokens.slice(0, -1).join('.');
    const currentObject = this.resolvePath(
      newPath || (path.startsWith('.') ? 'this' : ''),
      context,
      input,
      srcObject
    );
    currentObject[tokens[tokens.length - 1]] += value;
  }

  decValue(
    path: string,
    valuePath: string,
    context: PipelineExecutionContext,
    input: unknown,
    srcObject?: unknown
  ): void {
    const value = this.resolvePath(valuePath, context, input, srcObject);
    const tokens = path.split('.');
    const newPath = tokens.slice(0, -1).join('.');
    const currentObject = this.resolvePath(
      newPath || (path.startsWith('.') ? 'this' : ''),
      context,
      input,
      srcObject
    );
    currentObject[tokens[tokens.length - 1]] -= value;
  }

  eqValue(
    pathA: string,
    pathB: string,
    srcContext: PipelineExecutionContext,
    input: unknown,
    srcObject?: unknown
  ): void {
    const context = srcContext;
    const valueA = this.resolvePath(pathA, context, input, srcObject);
    const valueB = this.resolvePath(pathB, context, input, srcObject);
    context.floating = valueA === valueB;
  }

  neqValue(
    pathA: string,
    pathB: string,
    srcContext: PipelineExecutionContext,
    input: unknown,
    srcObject?: unknown
  ): void {
    const context = srcContext;
    const valueA = this.resolvePath(pathA, context, input, srcObject);
    const valueB = this.resolvePath(pathB, context, input, srcObject);
    context.floating = valueA !== valueB;
  }

  gtValue(
    pathA: string,
    pathB: string,
    srcContext: PipelineExecutionContext,
    input: unknown,
    srcObject?: unknown
  ): void {
    const context = srcContext;
    const valueA = this.resolvePath(pathA, context, input, srcObject);
    const valueB = this.resolvePath(pathB, context, input, srcObject);
    context.floating = valueA > valueB;
  }

  geValue(
    pathA: string,
    pathB: string,
    srcContext: PipelineExecutionContext,
    input: unknown,
    srcObject?: unknown
  ): void {
    const context = srcContext;
    const valueA = this.resolvePath(pathA, context, input, srcObject);
    const valueB = this.resolvePath(pathB, context, input, srcObject);
    context.floating = valueA >= valueB;
  }

  ltValue(
    pathA: string,
    pathB: string,
    srcContext: PipelineExecutionContext,
    input: unknown,
    srcObject?: unknown
  ): void {
    const context = srcContext;
    const valueA = this.resolvePath(pathA, context, input, srcObject);
    const valueB = this.resolvePath(pathB, context, input, srcObject);
    context.floating = valueA < valueB;
  }

  leValue(
    pathA: string,
    pathB: string,
    srcContext: PipelineExecutionContext,
    input: unknown,
    srcObject?: unknown
  ): void {
    const context = srcContext;
    const valueA = this.resolvePath(pathA, context, input, srcObject);
    const valueB = this.resolvePath(pathB, context, input, srcObject);
    context.floating = valueA <= valueB;
  }

  deleteValue(
    path: string,
    context: PipelineExecutionContext,
    input: unknown,
    srcObject?: unknown
  ): void {
    const tokens = path.split('.');
    const newPath = tokens.slice(0, -1).join('.');
    const currentObject = this.resolvePath(
      newPath || (path.startsWith('.') ? 'this' : ''),
      context,
      input,
      srcObject
    );
    delete currentObject[tokens[tokens.length - 1]];
  }

  getValue(
    srcPath: string | undefined,
    context: PipelineExecutionContext,
    input: unknown,
    srcObject?: unknown
  ): ResolvedValue {
    const path = srcPath || 'floating';
    const tokens = path.split('.');
    const newPath = tokens.slice(0, -1).join('.');
    const currentObject = this.resolvePath(
      newPath || (path.startsWith('.') ? 'this' : ''),
      context,
      input,
      srcObject
    );
    return currentObject[tokens[tokens.length - 1]];
  }

  /**
   * Runs a pipeline: a registered one by tag, the lines of an unregistered
   * one, or an already built one. The result is whatever the last step of the
   * pipeline returns, which only that pipeline knows.
   */
  async runPipeline(
    srcPipeline: string | string[] | RegisteredPipeline,
    input: unknown,
    srcObject?: unknown,
    depth = 0
  ): Promise<PipelineResult> {
    if (depth > 10) {
      throw new Error(
        'Pipeline depth is too high: perhaps you are using recursive pipelines?'
      );
    }
    const pipeline =
      typeof srcPipeline === 'string'
        ? this.getPipeline(srcPipeline)
        : srcPipeline;
    if (!pipeline) {
      throw new Error(`Pipeline not found ${srcPipeline}`);
    }
    // A pipeline that carries no compiler has not been built yet, so it still
    // holds its source lines.
    const built = pipeline as RegisteredPipeline;
    if (!built.compiler) {
      const tag = JSON.stringify(pipeline);
      this.registerPipeline(tag, pipeline as string[], false);
      const compiled = this.getPipeline(tag);
      return compiled.compiler.execute(
        compiled.compiled,
        input,
        srcObject,
        depth
      );
    }
    return built.compiler.execute(built.compiled, input, srcObject, depth);
  }

  use(
    item: ContainerPlugin | ServiceConstructor,
    name?: string,
    isSingleton?: boolean,
    onlyIfNotExists = false
  ): string {
    let instance: ContainerPlugin;
    if (typeof item === 'function') {
      if (item.name.endsWith('Compiler')) {
        // Compilers are told apart from other plugins by their name only, so
        // the cast is what the naming convention already decided.
        this.registerCompiler(item as unknown as CompilerConstructor);
        return item.name;
      }
      const Clazz = item;
      instance = new Clazz({ container: this }) as ContainerPlugin;
    } else {
      instance = item;
    }
    if (instance.register) {
      instance.register(this);
    }
    const tag = instance.settings ? instance.settings.tag : undefined;
    const itemName: string =
      name || instance.name || tag || item.name || instance.constructor.name;
    if (!onlyIfNotExists || !this.get(itemName)) {
      this.register(itemName, instance, isSingleton);
    }
    return itemName;
  }

  getCompiler(name: string): Compiler {
    const compiler = this.compilers[name];
    if (compiler) {
      return compiler;
    }
    if (this.parent) {
      return this.parent.getCompiler(name);
    }
    return this.compilers.default;
  }

  buildPipeline(
    srcPipeline: string[],
    prevPipeline: string[] = []
  ): RegisteredPipeline {
    const pipeline: string[] = [];
    if (srcPipeline && srcPipeline.length > 0) {
      for (let i = 0; i < srcPipeline.length; i += 1) {
        const line = srcPipeline[i];
        if (line.trim() === '$super') {
          for (let j = 0; j < prevPipeline.length; j += 1) {
            const s = prevPipeline[j].trim();
            if (!s.startsWith('->')) {
              pipeline.push(prevPipeline[j]);
            }
          }
        } else {
          pipeline.push(line);
        }
      }
    }
    const compilerName =
      !pipeline.length || !pipeline[0].startsWith('// compiler=')
        ? 'default'
        : pipeline[0].slice(12);
    const compiler = this.getCompiler(compilerName);
    const compiled = compiler.compile(pipeline);
    return {
      pipeline,
      compiler,
      compiled,
    };
  }

  registerPipeline(tag: string, pipeline: string[], overwrite = true): void {
    if (overwrite || !this.pipelines[tag]) {
      this.cache.pipelines = {};
      const prev = this.getPipeline(tag);
      this.pipelines[tag] = this.buildPipeline(
        pipeline,
        prev ? prev.pipeline : []
      );
    }
  }

  registerPipelineForChilds(
    childName: string,
    tag: string,
    pipeline: string[],
    overwrite = true
  ): void {
    if (!this.childPipelines) {
      this.childPipelines = {};
    }
    if (!this.childPipelines[childName]) {
      this.childPipelines[childName] = [];
    }
    this.childPipelines[childName].push({ tag, pipeline, overwrite });
  }

  getPipeline(tag: string): RegisteredPipeline | undefined {
    if (this.pipelines[tag]) {
      return this.pipelines[tag];
    }
    if (this.cache.pipelines[tag] !== undefined) {
      return this.cache.pipelines[tag] || undefined;
    }
    const keys = Object.keys(this.pipelines);
    for (let i = 0; i < keys.length; i += 1) {
      if (compareWildcars(tag, keys[i])) {
        this.cache.pipelines[tag] = this.pipelines[keys[i]];
        return this.pipelines[keys[i]];
      }
    }
    this.cache.pipelines[tag] = null;
    return undefined;
  }

  registerConfiguration(
    tag: string,
    configuration: Settings,
    overwrite = true
  ): void {
    if (overwrite || !this.configurations[tag]) {
      this.configurations[tag] = configuration;
    }
  }

  getConfiguration(tag: string): Settings | undefined {
    if (this.configurations[tag]) {
      return this.configurations[tag];
    }
    const keys = Object.keys(this.configurations);
    for (let i = 0; i < keys.length; i += 1) {
      if (compareWildcars(tag, keys[i])) {
        return this.configurations[keys[i]];
      }
    }
    return undefined;
  }

  loadPipelinesFromString(str = ''): void {
    const lines = str.split(/\n|\r|\r\n/);
    let currentName = '';
    let currentPipeline: string[] = [];
    let currentTitle = '';
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      if (line.trim() !== '') {
        if (line.startsWith('# ')) {
          if (currentName) {
            if (
              currentTitle &&
              !['default', 'pipelines'].includes(currentTitle.toLowerCase())
            ) {
              this.registerPipelineForChilds(
                currentTitle,
                currentName,
                currentPipeline
              );
            } else {
              this.registerPipeline(currentName, currentPipeline);
            }
          }
          currentTitle = line.slice(1).trim();
          currentName = '';
          currentPipeline = [];
        } else if (line.startsWith('## ')) {
          if (currentName) {
            if (
              currentTitle &&
              !['default', 'pipelines'].includes(currentTitle.toLowerCase())
            ) {
              this.registerPipelineForChilds(
                currentTitle,
                currentName,
                currentPipeline
              );
            } else {
              this.registerPipeline(currentName, currentPipeline);
            }
          }
          currentName = line.slice(2).trim();
          currentPipeline = [];
        } else if (currentName) {
          currentPipeline.push(line);
        }
      }
    }
    if (currentName) {
      if (
        currentTitle &&
        !['default', 'pipelines'].includes(currentTitle.toLowerCase())
      ) {
        this.registerPipelineForChilds(
          currentTitle,
          currentName,
          currentPipeline
        );
      } else {
        this.registerPipeline(currentName, currentPipeline);
      }
    }
  }

  async start(pipelineName = 'main'): Promise<void> {
    const keys = Object.keys(this.factory);
    for (let i = 0; i < keys.length; i += 1) {
      const current = this.factory[keys[i]];
      // A registered service may take part in the startup of the container by
      // exposing `start`; most do not.
      const instance = current.instance as StartableService | undefined;
      if (current.isSingleton && instance && instance.start) {
        await instance.start();
      }
    }
    if (this.getPipeline(pipelineName)) {
      await this.runPipeline(pipelineName, {}, this);
    }
  }
}

const defaultContainer = new Container();

export { Container, defaultContainer };
