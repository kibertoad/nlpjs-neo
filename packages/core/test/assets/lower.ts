import type {
  Container,
  PipelineExecutionContext,
  PipelineInput,
  ResolvedPath,
} from '../../src/index.js';

/** A pipeline step that lowercases its input, for the container tests. */
class Lower {
  /** Set by a test, to check that `use` calls it when the step is added. */
  declare register: (() => void) | undefined;

  declare name: string;

  constructor() {
    this.name = 'lower';
  }

  toLower(
    srcInput: PipelineInput,
    text: string,
    holder: string | undefined,
    container: Container | undefined,
    context: PipelineExecutionContext
  ): PipelineInput {
    const input = srcInput;
    const result = text.toLowerCase();
    if (holder && container) {
      container.setValue(holder, `"${result}"`, context, input, this);
    } else {
      input.text = result;
    }
    return input;
  }

  run(
    input: PipelineInput,
    arg1?: ResolvedPath,
    arg2?: ResolvedPath
  ): PipelineInput {
    let text = input.text ? input.text : input;
    let holder: string | undefined;
    let container: Container | undefined;
    let context: PipelineExecutionContext = {};
    if (arg1) {
      if (arg1.type === 'literal') {
        text = arg1.value;
      } else if (arg1.type === 'reference') {
        text = arg2 ? arg2.value : arg1.value;
        holder = arg1.src;
        container = arg1.container;
        context = arg1.context;
      }
    }
    return this.toLower(input, text as string, holder, container, context);
  }
}

export default Lower;
