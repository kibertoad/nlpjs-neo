import compile from './compile.js';
import type { EvaluationContext } from './types.js';

/** Resolves the `{{ ... }}` expressions of anything a pipeline answers with. */
class Template {
  compile<T>(str: T, context?: EvaluationContext): T {
    return compile(str)(context);
  }
}

export default Template;
