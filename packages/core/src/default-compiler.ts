import type { Container } from './container.js';
import type {
  CompiledPipeline,
  ContainerHolder,
  PipelineExecutionContext,
  PipelineToken,
  ResolvedPath,
} from './types.js';

/**
 * Callable a `reference` step resolves to: either the value itself when it is
 * a function, or the `run` method of the service it names.
 */
type PipelineCallable = (input: unknown, ...args: ResolvedPath[]) => unknown;

class DefaultCompiler {
  declare container: Container;
  declare name: string;

  constructor(container: ContainerHolder) {
    this.container =
      (container as { container?: Container }).container ||
      (container as Container);
    this.name = 'default';
  }

  getTokenFromWord(word: string): PipelineToken {
    if (word.startsWith('//')) {
      return {
        type: 'comment',
        value: word,
      };
    }
    if (
      [
        'set',
        'delete',
        'get',
        'inc',
        'dec',
        'eq',
        'neq',
        'gt',
        'ge',
        'lt',
        'le',
        'label',
        'goto',
        'jne',
        'je',
      ].includes(word)
    ) {
      return {
        type: word,
        arguments: [],
      };
    }
    if (word.startsWith('$')) {
      return {
        type: 'call',
        value: word.slice(1),
      };
    }
    return {
      type: 'reference',
      value: word,
    };
  }

  compile(pipeline: string[]): CompiledPipeline {
    const result: CompiledPipeline = [];
    for (let i = 0; i < pipeline.length; i += 1) {
      const line = pipeline[i].trim();
      if (!line) {
        continue;
      }
      const words = line.split(' ');
      const tokens: PipelineToken[] = [];
      let currentString = '';
      let currentQuote: string | undefined;
      for (let j = 0; j < words.length; j += 1) {
        const word = words[j];
        let processed = false;
        if (!currentQuote) {
          if (word.startsWith('"')) {
            currentString = word;
            processed = true;
            currentQuote = '"';
            if (word.endsWith('"')) {
              currentQuote = undefined;
              tokens.push(this.getTokenFromWord(currentString));
            }
          } else if (word.startsWith("'")) {
            currentString = word;
            processed = true;
            currentQuote = "'";
            if (word.endsWith("'")) {
              currentQuote = undefined;
              tokens.push(this.getTokenFromWord(currentString));
            }
          }
        } else {
          currentString = `${currentString} ${word}`;
          processed = true;
          if (word.endsWith(currentQuote)) {
            currentQuote = undefined;
            tokens.push(this.getTokenFromWord(currentString));
          }
        }
        if (!processed) {
          tokens.push(this.getTokenFromWord(word));
        }
      }
      result.push(tokens);
    }
    return result;
  }

  executeCall(
    firstToken: PipelineToken,
    context: PipelineExecutionContext,
    input: unknown,
    srcObject: unknown,
    depth: number
  ): Promise<unknown> {
    const pipeline = this.container.getPipeline(firstToken.value);
    if (!pipeline) {
      throw new Error(`Pipeline $${firstToken.value} not found.`);
    }
    return this.container.runPipeline(pipeline, input, srcObject, depth + 1);
  }

  executeReference(
    step: PipelineToken[],
    firstToken: PipelineToken,
    context: PipelineExecutionContext,
    input: unknown,
    srcObject: unknown
  ): unknown {
    const currentObject = this.container.resolvePath(
      firstToken.value,
      context,
      input,
      srcObject
    );
    const args: ResolvedPath[] = [];
    for (let i = 1; i < step.length; i += 1) {
      args.push(
        this.container.resolvePathWithType(
          step[i].value,
          context,
          input,
          srcObject
        )
      );
    }
    if (!currentObject) {
      throw new Error(`Method not found for step ${JSON.stringify(step)}`);
    }
    const method = currentObject.run || currentObject;
    if (typeof method === 'function') {
      const callable = method as PipelineCallable;
      return typeof currentObject === 'function'
        ? callable(input, ...args)
        : callable.bind(currentObject)(input, ...args);
    }
    return method;
  }

  doGoto(label: string, srcContext: PipelineExecutionContext): void {
    const context = srcContext;
    const index = context.labels ? context.labels[label] : undefined;
    context.cursor = index;
  }

  async executeAction(
    step: PipelineToken[],
    context: PipelineExecutionContext,
    input: unknown,
    srcObject: unknown,
    depth: number
  ): Promise<unknown> {
    let firstToken = step[0];
    if (firstToken && firstToken.value && firstToken.value.startsWith('->')) {
      if (depth > 0) {
        return input;
      }
      firstToken = { ...firstToken };
      firstToken.value = firstToken.value.slice(2);
    }
    switch (firstToken.type) {
      case 'set':
        this.container.setValue(
          step[1].value,
          step[2] ? step[2].value : undefined,
          context,
          input,
          srcObject
        );
        break;
      case 'delete':
        this.container.deleteValue(step[1].value, context, input, srcObject);
        break;
      case 'get':
        return this.container.getValue(
          step[1] ? step[1].value : undefined,
          context,
          input,
          srcObject
        );
      case 'inc':
        this.container.incValue(
          step[1] ? step[1].value : undefined,
          step[2] ? step[2].value : '1',
          context,
          input,
          srcObject
        );
        break;
      case 'dec':
        this.container.decValue(
          step[1] ? step[1].value : undefined,
          step[2] ? step[2].value : '1',
          context,
          input,
          srcObject
        );
        break;
      case 'eq':
        this.container.eqValue(
          step[1] ? step[1].value : undefined,
          step[2] ? step[2].value : undefined,
          context,
          input,
          srcObject
        );
        break;
      case 'neq':
        this.container.neqValue(
          step[1] ? step[1].value : undefined,
          step[2] ? step[2].value : undefined,
          context,
          input,
          srcObject
        );
        break;
      case 'gt':
        this.container.gtValue(
          step[1] ? step[1].value : undefined,
          step[2] ? step[2].value : undefined,
          context,
          input,
          srcObject
        );
        break;
      case 'ge':
        this.container.geValue(
          step[1] ? step[1].value : undefined,
          step[2] ? step[2].value : undefined,
          context,
          input,
          srcObject
        );
        break;
      case 'lt':
        this.container.ltValue(
          step[1] ? step[1].value : undefined,
          step[2] ? step[2].value : undefined,
          context,
          input,
          srcObject
        );
        break;
      case 'le':
        this.container.leValue(
          step[1] ? step[1].value : undefined,
          step[2] ? step[2].value : undefined,
          context,
          input,
          srcObject
        );
        break;
      case 'goto':
        this.doGoto(step[1].value, context);
        break;
      case 'jne':
        if (!context.floating) {
          this.doGoto(step[1].value, context);
        }
        break;
      case 'je':
        if (context.floating) {
          this.doGoto(step[1].value, context);
        }
        break;
      case 'call':
        return this.executeCall(firstToken, context, input, srcObject, depth);
      case 'reference':
        return this.executeReference(
          step,
          firstToken,
          context,
          input,
          srcObject
        );
      default:
        break;
    }
    return input;
  }

  findLabels(
    compiled: CompiledPipeline,
    srcLabels: Record<string, number>
  ): void {
    const labels = srcLabels;
    for (let i = 0; i < compiled.length; i += 1) {
      const current = compiled[i];
      if (current[0].type === 'label') {
        labels[current[1].value] = i;
      }
    }
  }

  async execute(
    compiled: CompiledPipeline,
    srcInput: unknown,
    srcObject?: unknown,
    depth = 0
  ): Promise<unknown> {
    let input = srcInput;
    const context: PipelineExecutionContext = { cursor: 0, labels: {} };
    this.findLabels(compiled, context.labels as Record<string, number>);
    while ((context.cursor as number) < compiled.length) {
      input = await this.executeAction(
        compiled[context.cursor as number],
        context,
        input,
        srcObject,
        depth
      );
      context.cursor = (context.cursor as number) + 1;
    }
    return input;
  }
}

export default DefaultCompiler;
